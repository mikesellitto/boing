#!/usr/bin/env python3
"""
Example Python script for sending notifications via Boing API
"""

import os
import json
import time
import requests
from typing import Optional, Dict, Any

class Boing:
    """Simple client for Boing notifications"""
    
    def __init__(self, api_url: str = None, auth_token: str = None):
        """
        Initialize the Boing client
        
        Args:
            api_url: The API endpoint URL
            auth_token: Bearer authentication token
        """
        self.api_url = api_url or os.getenv('BOING_API_URL', '<YOUR_API_URL_HERE>/api/send')
        self.auth_token = auth_token or os.getenv('BOING_AUTH_TOKEN', '<YOUR_AUTH_TOKEN_HERE>')
        
        if '<YOUR_' in self.auth_token:
            raise ValueError("Please configure your API URL and auth token")
    
    def send(self, 
             message: str, 
             title: str = "Notification",
             url: Optional[str] = None,
             data: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Send a notification
        
        Args:
            message: The notification body text
            title: The notification title
            url: Optional URL to open when clicked
            data: Optional custom data dictionary
            
        Returns:
            API response as dictionary
        """
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {self.auth_token}'
        }
        
        payload = {
            'message': message,
            'title': title
        }
        
        if url:
            payload['url'] = url
        if data:
            payload['data'] = data
        
        response = requests.post(self.api_url, json=payload, headers=headers)
        response.raise_for_status()
        
        return response.json()
    
    def quick_notify(self, notification_type: str, custom_message: str = None) -> Dict[str, Any]:
        """
        Send a quick notification with preset types
        
        Args:
            notification_type: One of: done, alert, reminder, test
            custom_message: Optional message to append
            
        Returns:
            API response as dictionary
        """
        messages = {
            'done': 'Task completed ✓',
            'alert': f'⚠️ Alert: {custom_message or "Attention needed"}',
            'reminder': f'Reminder: {custom_message or "Check your tasks"}',
            'test': f'Test notification at {time.strftime("%H:%M:%S")}'
        }
        
        message = messages.get(notification_type, notification_type)
        if custom_message and notification_type not in ['alert', 'reminder']:
            message = f"{message} - {custom_message}"
        
        return self.send(
            message=message,
            title=notification_type.title()
        )


def main():
    """Example usage of the InstantPush client"""
    
    # Initialize client
    push = InstantPush()
    
    # Example 1: Simple notification
    print("Sending simple notification...")
    result = push.send(
        message="Hello from Python!",
        title="Python Test"
    )
    print(f"Result: {result}")
    
    # Example 2: Notification with URL
    print("\nSending notification with URL...")
    result = push.send(
        message="Click to open documentation",
        title="Documentation",
        url="https://github.com/yourusername/boing"
    )
    print(f"Result: {result}")
    
    # Example 3: Quick notifications
    print("\nSending quick notifications...")
    
    # Task completed
    result = push.quick_notify('done')
    print(f"Done notification: {result}")
    
    time.sleep(1)
    
    # Alert
    result = push.quick_notify('alert', 'Server CPU at 90%')
    print(f"Alert notification: {result}")
    
    time.sleep(1)
    
    # Reminder
    result = push.quick_notify('reminder', 'Team meeting in 5 minutes')
    print(f"Reminder notification: {result}")
    
    # Example 4: Notification with custom data
    print("\nSending notification with custom data...")
    result = push.send(
        message="Process completed",
        title="Job Status",
        data={
            'job_id': '12345',
            'status': 'completed',
            'duration': 120,
            'timestamp': time.time()
        }
    )
    print(f"Result: {result}")


if __name__ == '__main__':
    try:
        main()
    except Exception as e:
        print(f"Error: {e}")
        exit(1)