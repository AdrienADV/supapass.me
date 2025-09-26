import { supabase } from '#start/routes';
import { HttpContext } from '@adonisjs/core/http';
import { GeneratePkpassService } from '#services/generate_pkpass_service';

export default class PassController {
    private generatePkpassService = new GeneratePkpassService()

    async generate({ response, user }: HttpContext) {
        const { data: pass, error: passError } = await supabase.from('passes').select('*').eq('user_id', user.id).select('*').single();
        if (passError) {
            return response.badRequest({ message: 'Error fetching pass' })
        }

        try {
            const passGenerated = await this.generatePkpassService.generatePkpass(pass, user.user_metadata.user_name);

            response.header('Content-Type', 'application/vnd.apple.pkpass')
            response.header('Content-Disposition', `attachment; filename=custom.pkpass`)
            response.header('Content-Length', passGenerated.buffer.length)
            response.header('Cache-Control', 'no-cache')
            return response.send(passGenerated.buffer)
        } catch (error) {
            console.error('Error generating PKPass:', error)
            return response.internalServerError({ message: 'Error generating pass' })
        }
    }
}