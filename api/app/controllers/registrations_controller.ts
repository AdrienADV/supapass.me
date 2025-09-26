import { GeneratePkpassService } from '#services/generate_pkpass_service';
import { supabase } from '#start/routes';
import { HttpContext } from '@adonisjs/core/http'

const generatePkpassService = new GeneratePkpassService()

export default class RegistrationsController {
    async register({ request, response }: HttpContext) {
        const authorisation = request.header('authorization')
        const { pushToken } = request.all()
        const { deviceLibraryIdentifier, serialNumber } = request.params()

        if (!authorisation?.startsWith('ApplePass ')) {
            return response.unauthorized({ error: 'Authorization invalide' });
        }
        const authorisationToken = authorisation.split(' ')[1]
        const { data: pass } = await supabase
            .from('passes')
            .select('*')
            .eq('serial_number', serialNumber)
            .eq('authentication_token', authorisationToken)
            .single()

        if (!pass) {
            return response.notFound({ error: 'Pass not found' });
        }

        const { error: updatePassError } = await supabase.from('passes').update({
            is_active: true
        }).eq('id', pass.id)

        if (updatePassError) {
            return response.badRequest({ error: 'Error updating pass' });
        }

        const deviceId = await this.getDeviceId(deviceLibraryIdentifier, pushToken)

        const { error: registrationError } = await supabase.from('registrations').insert({
            device_id: deviceId,
            pass_id: pass.id
        })

        if (registrationError) {
            return response.badRequest({ error: 'Error registering device' });
        }

        return response.ok({ message: 'Pass registered' });
    }

    async getDeviceId(deviceLibraryIdentifier: string, pushToken: string): Promise<string | null> {
        const { data: device } = await supabase
            .from('devices')
            .select('*')
            .eq('device_library_identifier', deviceLibraryIdentifier)
            .single()

        if (!device) {
            const { data: newDevice, error: insertError } = await supabase
                .from('devices')
                .insert({
                    push_token: pushToken,
                    device_library_identifier: deviceLibraryIdentifier
                })
                .select()
                .single()

            if (insertError || !newDevice) {
                console.error('Error creating device:', insertError)
                return null
            }

            return newDevice.id
        }

        if (device.push_token !== pushToken) {
            const { error: updateError } = await supabase
                .from('devices')
                .update({ push_token: pushToken })
                .eq('id', device.id)

            if (updateError) {
                console.error('Error updating pushToken:', updateError)
                return null
            }
        }

        return device.id
    }

    async getAll({ request, response }: HttpContext) {
        const { deviceLibraryIdentifier, passTypeIdentifier } = request.params()

        const { data: device } = await supabase
            .from('devices')
            .select('id')
            .eq('device_library_identifier', deviceLibraryIdentifier)
            .single()

        if (!device) {
            return response.noContent()
        }

        const { data: registrations, error: registrationsError } = await supabase
            .from('registrations')
            .select('pass_id')
            .eq('device_id', device.id)


        if (registrationsError) {
            return response.noContent()
        }

        if (!registrations || registrations.length === 0) {
            return response.noContent()
        }

        const passIds = registrations.map(reg => reg.pass_id)

        const { data: passes, error: passesError } = await supabase
            .from('passes')
            .select('serial_number')
            .in('id', passIds)
            .eq('pass_type_identifier', passTypeIdentifier)
            .eq('is_active', true)

        if (passesError) {
            return response.noContent()
        }

        if (!passes || passes.length === 0) {
            return response.noContent()
        }

        const serialNumbers: string[] = passes.map(pass => pass.serial_number)
        return response.ok(serialNumbers)
    }

    async getOne({ request, response, params }: HttpContext) {
        const { serialNumber, passTypeIdentifier } = params
        const authorisation = request.header('authorization')

        if (!authorisation?.startsWith('ApplePass ')) {
            return response.unauthorized();
        }

        const authorisationToken = authorisation.replace('ApplePass ', '');

        const { data: pass } = await supabase
            .from('passes')
            .select('*')
            .eq('serial_number', serialNumber)
            .eq('pass_type_identifier', passTypeIdentifier)
            .eq('authentication_token', authorisationToken)
            .single()

        if (!pass) {
            return response.notFound({ error: 'Pass not found' });
        }

        const user = await supabase.auth.admin.getUserById(pass.user_id)

        if (pass.authentication_token !== authorisationToken) {
            return response.unauthorized({ error: 'invalid token' });
        }


        try {
            const passGenerated = await generatePkpassService.generatePkpass(pass, user.data.user?.user_metadata?.user_name)

            response.header('Content-Type', 'application/vnd.apple.pkpass')
            response.header('Content-Length', passGenerated.buffer.length)
            response.send(passGenerated.buffer)
        } catch (error) {
            console.error('Error generating PKPass:', error)
            return response.internalServerError({ error: 'Error generating pass' })
        }
    }
}