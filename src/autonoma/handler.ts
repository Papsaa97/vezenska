import type { HandlerConfig } from '@autonoma-ai/sdk';
import { createNodeHandler } from '@autonoma-ai/server-node';
import { factories } from './factories';
import { TEST_ADMIN_EMAIL, TEST_ADMIN_PASSWORD } from './client';

const sharedSecret =
  process.env.AUTONOMA_SHARED_SECRET ||
  '3cac9b35f2109abafba2f0b16e56f3598a8bb322af65e34d3328fc5c1aea7c12';

let signingSecret =
  process.env.AUTONOMA_SIGNING_SECRET ||
  '8f9b7c6d5e4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c';

if (signingSecret === sharedSecret) {
  signingSecret = '8f9b7c6d5e4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c';
}

export const autonomaConfig: HandlerConfig = {
  scopeField: 'id',
  sharedSecret,
  signingSecret,
  factories,
  auth: async (_user, _ctx) => {
    return {
      credentials: {
        email: TEST_ADMIN_EMAIL,
        password: TEST_ADMIN_PASSWORD,
      },
    };
  },
};

export const autonomaNodeHandler = createNodeHandler(autonomaConfig);
