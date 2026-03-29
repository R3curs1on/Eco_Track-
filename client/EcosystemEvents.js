const CHANNEL_NAME = 'ecotrack-ecosystem';

function getChannel() {
    if (typeof BroadcastChannel === 'undefined') {
        return null;
    }

    return new BroadcastChannel(CHANNEL_NAME);
}

function broadcastEcosystemChanged(reason = 'updated') {
    const channel = getChannel();
    if (!channel) {
        return;
    }

    channel.postMessage({
        reason,
        at: Date.now()
    });
    channel.close();
}

function subscribeToEcosystemChanges(handler) {
    const channel = getChannel();
    if (!channel) {
        return () => {};
    }

    channel.onmessage = (event) => {
        handler(event.data);
    };

    return () => channel.close();
}

export {
    broadcastEcosystemChanged,
    subscribeToEcosystemChanges
};
