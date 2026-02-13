import requests
import json
import time

API_URL = "http://localhost:8000/api/generate"
# TEST_URL = "https://en.wikipedia.org/wiki/Small_Integer" 
# Use a smaller page or topic to be faster/safer

def test_generate_quiz_topic():
    print(f"Testing API with Topic: 'Photosynthesis'")
    
    start_time = time.time()
    try:
        # Note: The API now expects form-data, not JSON body
        response = requests.post(API_URL, data={"topic": "Photosynthesis"})
        end_time = time.time()
        
        print(f"Status Code: {response.status_code}")
        print(f"Time Taken: {end_time - start_time:.2f} seconds")
        
        if response.status_code == 200:
            data = response.json()
            print("\nSuccessfully generated quiz!")
            print(f"Title: {data.get('title')}")
            print(f"Summary: {data.get('summary')[:100]}...")
            print(f"Questions Generated: {len(data.get('quiz', []))}")
            return True
        else:
            print("\nError:")
            print(response.text)
            return False
            
    except Exception as e:
        print(f"\nException occurred: {str(e)}")
        return False

if __name__ == "__main__":
    test_generate_quiz_topic()
