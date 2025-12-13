import { Device, Call } from '@twilio/voice-sdk';

type IncomingHandler = (call: Call) => void;
type DisconnectedHandler = () => void;
type ErrorHandler = (error: Error) => void;
type ReadyHandler = () => void;

class TwilioDeviceManager {
  private device: Device | null = null;
  private currentCall: Call | null = null;
  private incomingHandlers: IncomingHandler[] = [];
  private disconnectedHandlers: DisconnectedHandler[] = [];
  private errorHandlers: ErrorHandler[] = [];
  private readyHandlers: ReadyHandler[] = [];

  initialize(token: string): void {
    if (this.device) {
      this.destroy();
    }

    this.device = new Device(token, {
      codecPreferences: [Call.Codec.Opus, Call.Codec.PCMU],
      enableImprovedSignalingErrorPrecision: true,
      logLevel: 1, // Enable debug logging
    });

    // Use 'registered' event (modern SDK) with fallback to 'ready' (older SDK)
    this.device.on('registered', () => {
      console.log('Twilio Device is registered and ready');
      this.readyHandlers.forEach(handler => handler());
    });

    this.device.on('error', (error: Error) => {
      console.error('Twilio Device error:', error);
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

      // Listen to call events for debugging
      call.on('accept', () => {
        console.log('Call accepted by agent');
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
      this.device.unregister();
      this.device.destroy();
      this.device = null;
    }

    this.incomingHandlers = [];
    this.disconnectedHandlers = [];
    this.errorHandlers = [];
    this.readyHandlers = [];
  }

  isReady(): boolean {
    return this.device?.state === Device.State.Registered;
  }

  getCurrentCall(): Call | null {
    return this.currentCall;
  }
}

export const twilioDeviceManager = new TwilioDeviceManager();
