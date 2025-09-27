// Definición de tipos y interfaces
interface User {
  id: string;
  email: string;
  phone: string;
  preferences: NotificationPreferences;
}

interface NotificationPreferences {
  email: boolean;
  sms: boolean;
  telegram: boolean;
  push: boolean;
}

interface NotificationStrategy {
  send(message: string): Promise<void>;
}

// SRP: Cada clase tiene una responsabilidad específica
class UserPreferencesValidator {
  validate(preferences: NotificationPreferences): boolean {
    return Object.values(preferences).some(pref => pref === true);
  }
}

// OCP: Extensible para nuevos tipos de notificación
class PushNotification implements NotificationStrategy {
  async send(message: string): Promise<void> {
    console.log(`Enviando push notification: ${message}`);
  }
}

class TelegramNotification implements NotificationStrategy {
  async send(message: string): Promise<void> {
    console.log(`Enviando Telegram message: ${message}`);
  }
}

// Orquestador que usa ambos principios
class NotificationService {
  constructor(
    private validator: UserPreferencesValidator,
    private strategies: Map<string, NotificationStrategy>
  ) {}
  
  async notifyUser(user: User, message: string): Promise<void> {
    if (!this.validator.validate(user.preferences)) {
      throw new Error('Usuario no tiene preferencias de notificación válidas');
    }
    
    const notifications: Promise<void>[] = [];
    
    if (user.preferences.email) {
      notifications.push(this.strategies.get('email')?.send(message) || Promise.resolve());
    }
    
    if (user.preferences.sms) {
      notifications.push(this.strategies.get('sms')?.send(message) || Promise.resolve());
    }

    if (user.preferences.telegram) {
      notifications.push(this.strategies.get('telegram')?.send(message) || Promise.resolve());
    }
    
    await Promise.all(notifications);
  }
}

const validator = new UserPreferencesValidator();
const strategies = new Map<string, NotificationStrategy>();
strategies.set('email', {
  async send(message: string) {
    console.log(`Enviando email: ${message}`);
  }
});
strategies.set('sms', {
  async send(message: string) {
    console.log(`Enviando SMS: ${message}`);
  }
});
strategies.set('telegram', {
  async send(message: string) {
    console.log(`Enviando Telegram: ${message}`);
  }
});
strategies.set('push', new PushNotification());
const notificationService = new NotificationService(validator, strategies);

const user: User = {
  id: '1',
  email: 'test@example.com',
  phone: '123456789',
  preferences: {
    email: true,
    sms: false,
    telegram: false,
    push: false,
  }
};