import requests
import json

def test_mistral_api(api_key):
    url = "https://api.mistral.ai/v1/chat/completions"
    
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {api_key}"
    }
    
    payload = {
        "model": "mistral-tiny",
        "messages": [
            {"role": "user", "content": "Say 'Mistral API is working correctly!'"}
        ],
        "temperature": 0.7
    }
    
    print("Sending request to Mistral AI...")
    try:
        response = requests.post(url, headers=headers, data=json.dumps(payload))
        
        if response.status_code == 200:
            result = response.json()
            answer = result['choices'][0]['message']['content']
            print("\n[SUCCESS] Mistral API responded:")
            print(f"Answer: {answer}")
        else:
            print(f"\n[ERROR] API call failed with status code: {response.status_code}")
            print(f"Details: {response.text}")
            
    except Exception as e:
        print(f"\n[EXCEPT] An error occurred: {e}")

if __name__ == "__main__":
    # The API key provided by the user
    API_KEY = "8tk56dLjlI8dSlOr9WH06yphzOzGpxgI"
    test_mistral_api(API_KEY)
