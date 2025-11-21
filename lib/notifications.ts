import * as Device from 'expo-device';
import { Alert, Platform } from 'react-native';

async function loadNotifications() {
    return null;
    // if (Constants.appOwnership === 'expo') {
    //     return null;
    // }
    // const mod = await import('expo-notifications');
    // return mod;
}

export async function registerForPushNotificationsAsync() {
    let token;

    const Notifications = await loadNotifications();
    if (!Notifications) {
        return token;
    }

    await Notifications.setNotificationHandler({
        handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: false,
            shouldShowBanner: true,
            shouldShowList: true,
        }),
    });

    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
        });
    }

    if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }
        if (finalStatus !== 'granted') {
            return;
        }
    }

    return token;
}

export async function scheduleDailyReminder(hour: number = 9, minute: number = 0) {
    const Notifications = await loadNotifications();
    if (!Notifications) {
        Alert.alert('Notifications unavailable', 'Use a development build to enable notifications.');
        return;
    }

    await Notifications.cancelAllScheduledNotificationsAsync();

    await Notifications.scheduleNotificationAsync({
        content: {
            title: "Time to learn! 🎓",
            body: "Keep your streak alive with a quick review session.",
            sound: true,
        },
        trigger: {
            hour,
            minute,
            type: Notifications.SchedulableTriggerInputTypes.DAILY,
        },
    });
}

export async function cancelAllNotifications() {
    const Notifications = await loadNotifications();
    if (!Notifications) {
        Alert.alert('Notifications unavailable', 'Use a development build to enable notifications.');
        return;
    }
    await Notifications.cancelAllScheduledNotificationsAsync();
}
