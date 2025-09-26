import { supabase } from '#start/routes';
import { HttpContext } from '@adonisjs/core/http'

export default class UnregistrationsController {
    async unregister({ request, response }: HttpContext) {
        console.log('UNREGISTER', request.params())
        const { deviceLibraryIdentifier, passTypeIdentifier, serialNumber } = request.params()
        const authorisation = request.header('authorization')

        if (!authorisation?.startsWith('ApplePass ')) {
            return response.unauthorized({ error: 'Authorization invalide' });
        }

        const authorisationToken = authorisation.replace('ApplePass ', '');

        const [device, pass] = await Promise.all([
            await supabase
                .from('devices')
                .select('*')
                .eq('device_library_identifier', deviceLibraryIdentifier)
                .single(),
            await supabase
                .from('passes')
                .select('*')
                .eq('serial_number', serialNumber)
                .eq('pass_type_identifier', passTypeIdentifier)
                .eq('authentication_token', authorisationToken)
                .single()
        ])

        if (!device.data || !pass.data) {
            return response.unauthorized({ error: 'Device or pass not found' });
        }

        await supabase
            .from('registrations')
            .delete()
            .eq('device_id', device.data.id)
            .eq('pass_id', pass.data.id)

        await supabase
            .from('passes')
            .update({
                is_active: false
            })
            .eq('id', pass.data.id)

        const { data: remainingRegistrations } = await supabase
            .from('registration')
            .select('*')
            .eq('device_id', device.data.id)

        if (!remainingRegistrations || remainingRegistrations?.length === 0) {
            await supabase
                .from('devices')
                .delete()
                .eq('id', device.data.id)
        }

        return response.ok({ message: 'Unregistration successful' })
    }
}