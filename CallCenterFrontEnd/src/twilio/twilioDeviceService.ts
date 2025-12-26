import { Device, Call } from '@twilio/voice-sdk';

type IncomingHandler = (call: Call) => void;
type DisconnectedHandler = () => void;
type ErrorHandler = (error: Error) => void;
type ReadyHandler = () => void;
type AcceptedHandler = (call: Call) => void;

class TwilioDeviceManager {
  private device: Device | null = null;
  private currentCall: Call | null = null;
  private incomingHandlers: IncomingHandler[] = [];
  private disconnectedHandlers: DisconnectedHandler[] = [];
  private errorHandlers: ErrorHandler[] = [];
  private readyHandlers: ReadyHandler[] = [];
  private acceptedHandlers: AcceptedHandler[] = [];
  private isInitializing: boolean = false;

  initialize(token: string): void {
    // Prevent double initialization (especially from React Strict Mode)
    if (this.isInitializing) {
      console.log('Twilio Device is already initializing, skipping...');
      return;
    }

    if (this.device) {
      this.destroy();
    }

    this.isInitializing = true;
    this.device = new Device(token, {
      codecPreferences: [Call.Codec.Opus, Call.Codec.PCMU],
      enableImprovedSignalingErrorPrecision: true,
      logLevel: 1, // Enable debug logging
    });

    // Use 'registered' event (modern SDK) with fallback to 'ready' (older SDK)
    this.device.on('registered', () => {
      console.log('Twilio Device is registered and ready');
      this.isInitializing = false;
      this.readyHandlers.forEach(handler => handler());
    });

    this.device.on('error', (error: Error) => {
      console.error('Twilio Device error:', error);
      this.isInitializing = false;
      this.errorHandlers.forEach(handler => handler(error));
    });

    this.device.on('unregistered', () => {
      console.log('Twilio Device unregistered');
    });

    this.device.on('incoming', (call: Call) => {
      console.log('Incoming call received:', {
        from: call.parameters.From,
        to: call.parameters.To,
        callSid: call.parameters.CallSid,
        direction: call.direction,
        status: call.status(),
      });
      this.currentCall = call;

      // Listen to call events
      call.on('accept', () => {
        console.log('Call accepted - audio connected');
        this.acceptedHandlers.forEach(handler => handler(call));
      });

      call.on('disconnect', () => {
        console.log('Call disconnected');
        this.currentCall = null;
        this.disconnectedHandlers.forEach(handler => handler());
      });

      call.on('cancel', () => {
        console.log('Call cancelled by caller');
        this.currentCall = null;
        this.disconnectedHandlers.forEach(handler => handler());
      });

      call.on('reject', () => {
        console.log('Call rejected by agent');
        this.currentCall = null;
        this.disconnectedHandlers.forEach(handler => handler());
      });

      call.on('error', (error: Error) => {
        console.error('Call error:', error);
      });

      this.incomingHandlers.forEach(handler => handler(call));
    });

    this.device.register();
  }

  onIncoming(handler: IncomingHandler): void {
    this.incomingHandlers.push(handler);
  }

  onDisconnected(handler: DisconnectedHandler): void {
    this.disconnectedHandlers.push(handler);
  }

  onError(handler: ErrorHandler): void {
    this.errorHandlers.push(handler);
  }

  onReady(handler: ReadyHandler): void {
    this.readyHandlers.push(handler);
  }

  onAccepted(handler: AcceptedHandler): void {
    this.acceptedHandlers.push(handler);
  }

  answer(call?: Call): void {
    const callToAnswer = call || this.currentCall;
    if (callToAnswer) {
      console.log('Answering call:', {
        callSid: callToAnswer.parameters.CallSid,
        from: callToAnswer.parameters.From,
        status: callToAnswer.status(),
      });

      try {
        callToAnswer.accept();
        this.currentCall = callToAnswer;
        console.log('Call accepted successfully, new status:', callToAnswer.status());
      } catch (error) {
        console.error('Error accepting call:', error);
      }
    } else {
      console.warn('No call to answer - currentCall is null');
    }
  }

  hangup(): void {
    if (this.currentCall) {
      this.currentCall.disconnect();
      this.currentCall = null;
    }
  }

  reject(): void {
    if (this.currentCall) {
      this.currentCall.reject();
      this.currentCall = null;
    }
  }

  /**
   * Initiate a direct outbound call from the browser
   * This connects the agent directly without needing to accept an incoming call
   * @param params - Parameters to pass to TwiML endpoint (To, callLogId)
   * @returns The Call object or null if device not ready
   */
  async connectOutbound(params: { To: string; callLogId: string }): Promise<Call | null> {
    if (!this.device || this.device.state !== Device.State.Registered) {
      console.error('Cannot connect outbound: Device not ready');
      return null;
    }

    try {
      console.log('Initiating direct outbound call with params:', params);

      // device.connect() initiates an outbound call from the browser
      // The params are sent to the TwiML application endpoint
      const call = await this.device.connect({ params });

      this.currentCall = call;
      console.log('Outbound call initiated:', {
        callSid: call.parameters.CallSid,
        status: call.status(),
      });

      // Set up call event handlers
      call.on('accept', () => {
        console.log('Outbound call accepted - audio connected');
        this.acceptedHandlers.forEach(handler => handler(call));
      });

      call.on('disconnect', () => {
        console.log('Outbound call disconnected');
        this.currentCall = null;
        this.disconnectedHandlers.forEach(handler => handler());
      });

      call.on('cancel', () => {
        console.log('Outbound call cancelled');
        this.currentCall = null;
        this.disconnectedHandlers.forEach(handler => handler());
      });

      call.on('error', (error: Error) => {
        console.error('Outbound call error:', error);
        this.errorHandlers.forEach(handler => handler(error));
      });

      // Listen for ringing status (when customer's phone rings)
      call.on('ringing', () => {
        console.log('Outbound call ringing - customer phone is ringing');
      });

      return call;
    } catch (error) {
      console.error('Error initiating outbound call:', error);
      this.errorHandlers.forEach(handler => handler(error as Error));
      return null;
    }
  }

  mute(isMuted: boolean): void {
    if (this.currentCall) {
      this.currentCall.mute(isMuted);
    }
  }

  destroy(): void {
    if (this.currentCall) {
      this.currentCall.disconnect();
      this.currentCall = null;
    }

    if (this.device) {
      // Only unregister if device is in a registered state
      // Avoid error when device is still "registering"
      const deviceState = this.device.state;
      if (deviceState === Device.State.Registered) {
        try {
          this.device.unregister();
        } catch (error) {
          console.warn('Error unregistering device:', error);
        }
      }

      try {
        this.device.destroy();
      } catch (error) {
        console.warn('Error destroying device:', error);
      }
      this.device = null;
    }

    this.isInitializing = false;
    this.incomingHandlers = [];
    this.disconnectedHandlers = [];
    this.errorHandlers = [];
    this.readyHandlers = [];
    this.acceptedHandlers = [];
  }

  isReady(): boolean {
    return this.device?.state === Device.State.Registered;
  }

  getIsInitializing(): boolean {
    return this.isInitializing;
  }

  getCurrentCall(): Call | null {
    return this.currentCall;
  }
}

export const twilioDeviceManager = new TwilioDeviceManager();
