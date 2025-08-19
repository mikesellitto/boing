#!/usr/bin/env node

/**
 * Example Node.js script for sending notifications via Boing API
 */

const https = require('https');
const { URL } = require('url');

class Boing {
    constructor(apiUrl = null, authToken = null) {
        this.apiUrl = apiUrl || process.env.BOING_API_URL || '<YOUR_API_URL_HERE>/api/send';
        this.authToken = authToken || process.env.BOING_AUTH_TOKEN || '<YOUR_AUTH_TOKEN_HERE>';
        
        if (this.authToken.includes('<YOUR_')) {
            throw new Error('Please configure your API URL and auth token');
        }
    }

    /**
     * Send a notification
     * @param {string} message - The notification body text
     * @param {string} title - The notification title
     * @param {string} url - Optional URL to open when clicked
     * @param {object} data - Optional custom data object
     * @returns {Promise<object>} API response
     */
    async send(message, title = 'Notification', url = null, data = null) {
        const payload = JSON.stringify({
            message,
            title,
            ...(url && { url }),
            ...(data && { data })
        });

        const parsedUrl = new URL(this.apiUrl);
        
        const options = {
            hostname: parsedUrl.hostname,
            port: parsedUrl.port || 443,
            path: parsedUrl.pathname,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(payload),
                'Authorization': `Bearer ${this.authToken}`
            }
        };

        return new Promise((resolve, reject) => {
            const req = https.request(options, (res) => {
                let data = '';

                res.on('data', (chunk) => {
                    data += chunk;
                });

                res.on('end', () => {
                    try {
                        const response = JSON.parse(data);
                        if (res.statusCode === 200) {
                            resolve(response);
                        } else {
                            reject(new Error(`API Error: ${response.error || 'Unknown error'}`));
                        }
                    } catch (e) {
                        reject(new Error(`Failed to parse response: ${e.message}`));
                    }
                });
            });

            req.on('error', (error) => {
                reject(error);
            });

            req.write(payload);
            req.end();
        });
    }

    /**
     * Send a quick notification with preset types
     * @param {string} type - One of: done, alert, reminder, test
     * @param {string} customMessage - Optional message to append
     * @returns {Promise<object>} API response
     */
    async quickNotify(type, customMessage = null) {
        const messages = {
            done: 'Task completed ✓',
            alert: `⚠️ Alert: ${customMessage || 'Attention needed'}`,
            reminder: `Reminder: ${customMessage || 'Check your tasks'}`,
            test: `Test notification at ${new Date().toLocaleTimeString()}`
        };

        const message = messages[type] || type;
        const finalMessage = customMessage && !['alert', 'reminder'].includes(type) 
            ? `${message} - ${customMessage}` 
            : message;

        return this.send(
            finalMessage,
            type.charAt(0).toUpperCase() + type.slice(1)
        );
    }
}

// Example usage
async function main() {
    try {
        // Initialize client
        const push = new Boing();

        // Example 1: Simple notification
        console.log('Sending simple notification...');
        let result = await push.send(
            'Hello from Node.js!',
            'Node.js Test'
        );
        console.log('Result:', result);

        // Example 2: Notification with URL
        console.log('\nSending notification with URL...');
        result = await push.send(
            'Click to open documentation',
            'Documentation',
            'https://github.com/<YOUR_USERNAME>/boing'
        );
        console.log('Result:', result);

        // Example 3: Quick notifications
        console.log('\nSending quick notifications...');
        
        // Task completed
        result = await push.quickNotify('done');
        console.log('Done notification:', result);

        // Wait a bit between notifications
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Alert
        result = await push.quickNotify('alert', 'Server CPU at 90%');
        console.log('Alert notification:', result);

        await new Promise(resolve => setTimeout(resolve, 1000));

        // Reminder
        result = await push.quickNotify('reminder', 'Team meeting in 5 minutes');
        console.log('Reminder notification:', result);

        // Example 4: Notification with custom data
        console.log('\nSending notification with custom data...');
        result = await push.send(
            'Process completed',
            'Job Status',
            null,
            {
                job_id: '12345',
                status: 'completed',
                duration: 120,
                timestamp: Date.now()
            }
        );
        console.log('Result:', result);

    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

// Run if executed directly
if (require.main === module) {
    main();
}

// Export for use as module
module.exports = Boing;