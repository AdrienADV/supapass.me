import app from '@adonisjs/core/services/app';
import env from '#start/env';
import { PKPass } from 'passkit-generator';

interface PassData {
  authentication_token: string;
  serial_number: string;
  pass_type_identifier?: string;
  [key: string]: any;
}

interface GeneratedPass {
  buffer: Buffer;
}

export class GeneratePkpassService {

  async generatePkpass(data: PassData, userName: string): Promise<GeneratedPass> {
    const { wwdr, signerCert, signerKey, signerKeyPassphrase } = {
      wwdr: Buffer.from(env.get('WWDR'), 'base64').toString('utf-8'),
      signerCert: Buffer.from(env.get('SIGNER_CERT'), 'base64').toString('utf-8'),
      signerKey: Buffer.from(env.get('SIGNER_KEY'), 'base64').toString('utf-8'),
      signerKeyPassphrase: env.get('SIGNER_KEY_PASSPHRASE')
    };

    const contributionLevel = this.getContributionLevel(data);

    const pass = await PKPass.from({
      model: app.makePath('app/models/supapass.pass'),
      certificates: {
        wwdr,
        signerCert,
        signerKey,
        signerKeyPassphrase
      },
    }, {
      organizationName: data.is_core_member ? "Supabase Core Member" : "Supabase Contributor",
      description: data.is_core_member ? "Supabase Core Member" : "Supabase Contributor",
      logoText: data.is_core_member ? "Supabase Core Member" : "Supabase Contributor",
      authenticationToken: data.authentication_token,
      teamIdentifier: env.get('TEAM_IDENTIFIER'),
      webServiceURL: env.get('APP_URL'),
      passTypeIdentifier: data.pass_type_identifier,
      serialNumber: data.serial_number
    });
    pass.setBarcodes(`https://github.com/${userName}`);
    pass.headerFields[0].value = contributionLevel;
    pass.primaryFields[0].value = userName;

    pass.secondaryFields[0].value = data.pull_requests_count;
    pass.secondaryFields[1].value = data.merged_pull_requests_count;

    pass.auxiliaryFields[0].value = data.issues_opened_count;
    pass.auxiliaryFields[1].value = data.total_contributions_count;

    const buffer = pass.getAsBuffer();

    return { buffer };
  }

  getContributionLevel = (stats: PassData) => {
    if (!stats) return "Loading...";

    if (stats.merged_pull_requests_count >= 3) return "Gold";

    // Silver : Has at least 1 PR (open or closed)
    if (stats.pull_requests_count >= 1) return "Silver";

    // Bronze : Has at least 1 issue opened
    if (stats.issues_opened_count >= 3) return "Bronze";

    return "Newcomer";
  };
}