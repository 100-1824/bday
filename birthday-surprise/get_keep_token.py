import gpsoauth
import getpass
import uuid

def get_token():
    print("\n=== Google Keep Master Token Generator ===")
    print("This script uses 'gpsoauth' to authenticate with Google.")
    
    print("\n[IMPORTANT] CREDENTIALS GUIDE:")
    print("1. If you have 2-Factor Authentication (2FA) enabled (Most likely):")
    print("   -> You MUST use an 'App Password'.")
    print("   -> Go to: https://myaccount.google.com/apppasswords")
    print("   -> Create one (name it 'BirthdayApp') and paste that 16-character code here.")
    print("2. If you do NOT have 2FA:")
    print("   -> You can use your regular password (but this often fails due to security checks).")
    
    email = input("\nGoogle Email: ").strip()
    password = getpass.getpass("Password (App Password recommended): ").strip().replace(" ", "")
    
    
    # Generate a random Android ID (hex string)
    android_id = uuid.uuid4().hex[:16]
    print(f"Using Device ID: {android_id}")
    
    print("\nAttempting to authenticate...")
    
    try:
        # Perform Master Login
        response = gpsoauth.perform_master_login(email, password, android_id)
        
        if "Token" in response:
            master_token = response["Token"]
            print("\n------------------------------------------------")
            print("SUCCESS! Here is your Master Token:")
            print(f"{master_token}")
            print("------------------------------------------------")
            print("Please COPY this token and paste it into 'app.py' as KEEP_TOKEN.")
        
        else:
            print(f"\n[ERROR] Login Failed: {response.get('Error')}")
            print(f"Full Response: {response}") # PRINT EVERYTHING
            
            if "ErrorDetail" in response:
                print(f"Detail: {response.get('ErrorDetail')}")
            
            if response.get("Error") == "BadAuthentication":
                print("\n[Likely Cause] Invalid Password or 2FA blocked it.")
                print("-> Please generate an App Password at https://myaccount.google.com/apppasswords")
            elif response.get("Error") == "NeedsBrowser":
                print("\n[Likely Cause] 2FA is interfering, or account is locked.")
                print("-> Try using an App Password.")
        else:
            print("\n[ERROR] Unknown response from Google:")
            print(response)
            
    except Exception as e:
        print(f"\n[CRITICAL ERROR] Script crashed: {e}")

if __name__ == '__main__':
    get_token()
