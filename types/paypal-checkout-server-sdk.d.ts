// types/paypal-checkout-server-sdk.d.ts
declare module '@paypal/checkout-server-sdk' {
  export namespace core {
    class SandboxEnvironment {
      constructor(clientId: string, clientSecret: string);
    }
    
    class LiveEnvironment {
      constructor(clientId: string, clientSecret: string);
    }
    
    class PayPalHttpClient {
      constructor(environment: SandboxEnvironment | LiveEnvironment);
      execute(request: any): Promise<any>;
    }
  }

  export namespace orders {
    class OrdersCreateRequest {
      prefer(returnRepresentation: string): void;
      requestBody(body: any): void;
    }

    class OrdersCaptureRequest {
      constructor(orderId: string);
      requestBody(body: any): void;
    }
  }

  export namespace notifications {
    namespace webhooks {
      class WebhookVerifySignatureRequest {
        requestBody(body: any): void;
      }
    }
  }
}