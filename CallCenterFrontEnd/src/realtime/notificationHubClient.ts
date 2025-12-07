import * as signalR from '@microsoft/signalr';
import { API_BASE_URL } from '../config/apiConfig';

export const createNotificationHubConnection = (
  accessTokenFactory?: () => string | Promise<string>
): signalR.HubConnection => {
  const options: signalR.IHttpConnectionOptions = {
    withCredentials: false,
  };

  if (accessTokenFactory) {
    options.accessTokenFactory = accessTokenFactory;
  }

  const connection = new signalR.HubConnectionBuilder()
    .withUrl(`${API_BASE_URL}/hubs/callcenter`, options)
    .withAutomaticReconnect()
    .configureLogging(signalR.LogLevel.Debug) // Changed to Debug for more details
    .build();

  return connection;
};
