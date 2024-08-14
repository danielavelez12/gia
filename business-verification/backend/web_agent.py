import os
import json
import requests
from bs4 import BeautifulSoup
from dotenv import load_dotenv
import anthropic
import googlemaps
from linkedin_api import Linkedin
from db import create_new_entity_log
import re
import time
from tqdm import tqdm

load_dotenv()

class EntitySummarizer:
    def __init__(self):
        self.anthropic_api_key = os.getenv("ANTHROPIC_API_KEY")
        self.yelp_api_key = os.getenv("YELP_API_KEY")
        self.google_maps_api_key = os.getenv("GOOGLE_MAPS_API_KEY")
        self.linkedin_username = os.getenv("LINKEDIN_USERNAME")
        self.linkedin_password = os.getenv("LINKEDIN_PASSWORD")
        self.client = anthropic.Anthropic(api_key=self.anthropic_api_key)
        self.gmaps = googlemaps.Client(key=self.google_maps_api_key, timeout=5)  # Set timeout here
        self.linkedin_api = Linkedin(self.linkedin_username, self.linkedin_password)

    def fetch_webpage(self, url):
        print(f"Fetching webpage: {url}")
        try:
            with tqdm(total=5, desc="Fetching webpage", unit="s") as pbar:
                response = requests.get(url, timeout=5)
                for _ in range(5):
                    time.sleep(1)
                    pbar.update(1)
            if response.status_code == 200:
                print("Webpage fetched successfully")
                return response.text
            else:
                raise Exception(f"Failed to fetch the page. Status code: {response.status_code}")
        except requests.Timeout:
            print("Timeout occurred while fetching webpage")
        except Exception as e:
            print(f"An error occurred while fetching webpage: {str(e)}")
        return None

    def extract_text(self, html):
        print("Extracting text from HTML")
        soup = BeautifulSoup(html, 'html.parser')
        for script in soup(["script", "style"]):
            script.decompose()
        text = soup.get_text()
        lines = (line.strip() for line in text.splitlines())
        chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
        text = '\n'.join(chunk for chunk in chunks if chunk)
        print("Text extracted successfully")
        return text

    def summarize_entity(self, text):
        print("Summarizing entity information")
        prompt = f"\n\nHuman: Based on the following business information, provide a JSON object with two keys: 'entity_name' (the simple name of the business, no TM or anything) and 'summary' (a two-sentence summary of the business, its main products or services, and any standout features). Format your response as a valid JSON string.\n\n{text[:10000]}\n\nAssistant:"
        try:
            with tqdm(total=5, desc="Summarizing entity", unit="s") as pbar:
                response = self.client.completions.create(
                    model="claude-2.1",
                    prompt=prompt,
                    max_tokens_to_sample=300,
                )
                for _ in range(5):
                    time.sleep(1)
                    pbar.update(1)
            json_match = re.search(r'\{[\s\S]*\}', response.completion)
            if json_match:
                json_str = json_match.group(0)
                entity_info = json.loads(json_str)
                print(f"Entity summarized: {entity_info['entity_name']}")
                return entity_info
            else:
                raise ValueError("Could not extract JSON from Claude's response")
        except anthropic.APITimeoutError:
            print("Timeout occurred while summarizing entity")
        except Exception as e:
            print(f"An error occurred while summarizing entity: {str(e)}")
        return None

    def search_yelp(self, term, location="NYC"):
        print(f"Searching Yelp for: {term}")
        url = "https://api.yelp.com/v3/businesses/search"
        headers = {"Authorization": f"Bearer {self.yelp_api_key}"}
        params = {"term": term, "location": location, "limit": 1}
        try:
            with tqdm(total=5, desc="Searching Yelp", unit="s") as pbar:
                response = requests.get(url, headers=headers, params=params, timeout=5)
                for _ in range(5):
                    time.sleep(1)
                    pbar.update(1)
            if response.status_code == 200:
                data = response.json()
                if data["businesses"]:
                    business = data["businesses"][0]
                    yelp_info = {
                        "name": business["name"],
                        "rating": business["rating"],
                        "review_count": business["review_count"],
                        "address": " ".join(business["location"]["display_address"])
                    }
                    print(f"Yelp information found for: {yelp_info['name']}")
                    return yelp_info
        except requests.Timeout:
            print("Timeout occurred while searching Yelp")
        except Exception as e:
            print(f"An error occurred while searching Yelp: {str(e)}")
        print("No Yelp information found")
        return None

    def get_google_maps_info(self, entity_name, city):
        print(f"Fetching Google Maps information for: {entity_name}")
        try:
            with tqdm(total=5, desc="Fetching Google Maps info", unit="s") as pbar:
                places_result = self.gmaps.places(f"{entity_name} in {city}")
                for _ in range(5):
                    time.sleep(1)
                    pbar.update(1)
            if places_result['status'] == 'OK' and places_result['results']:
                place = places_result['results'][0]
                place_id = place['place_id']
                with tqdm(total=5, desc="Fetching place details", unit="s") as pbar:
                    details_result = self.gmaps.place(place_id, fields=['name', 'formatted_address', 'formatted_phone_number', 'rating', 'user_ratings_total', 'website', 'opening_hours'])
                    for _ in range(5):
                        time.sleep(1)
                        pbar.update(1)
                if details_result['status'] == 'OK':
                    details = details_result['result']
                    maps_info = {
                        'name': details.get('name'),
                        'address': details.get('formatted_address'),
                        'phone': details.get('formatted_phone_number'),
                        'rating': details.get('rating'),
                        'total_ratings': details.get('user_ratings_total'),
                        'website': details.get('website'),
                        'opening_hours': details.get('opening_hours', {}).get('weekday_text') if 'opening_hours' in details else None
                    }
                    print(f"Google Maps information found for: {maps_info['name']}")
                    return maps_info
        except Exception as e:
            print(f"An error occurred while fetching Google Maps information: {str(e)}")
        print("No Google Maps information found")
        return None

    def search_linkedin_company(self, company_name):
        print(f"Searching LinkedIn for: {company_name}")
        try:
            with tqdm(total=5, desc="Searching LinkedIn", unit="s") as pbar:
                start_time = time.time()
                search_results = self.linkedin_api.search_companies(company_name)
                elapsed_time = time.time() - start_time
                remaining_time = max(0, 5 - elapsed_time)
                time.sleep(remaining_time)
                pbar.update(5)
            
            if search_results:
                company = search_results[0]
                company_id = company['urn_id']
                with tqdm(total=5, desc="Fetching company details", unit="s") as pbar:
                    start_time = time.time()
                    company_info = self.linkedin_api.get_company(company_id)
                    elapsed_time = time.time() - start_time
                    remaining_time = max(0, 5 - elapsed_time)
                    time.sleep(remaining_time)
                    pbar.update(5)
                
                linkedin_info = {
                    'name': company_info.get('name'),
                    'vanity_name': company_info.get('vanityName'),
                    'description': company_info.get('description'),
                    'website': company_info.get('websiteUrl'),
                    'industry': company_info.get('companyIndustries', [{}])[0].get('localizedName'),
                    'company_size': company_info.get('staffCountRange', {}).get('start'),
                    'followers': company_info.get('followerCount'),
                    'locations': [loc.get('line1') for loc in company_info.get('confirmedLocations', [])],
                    'founded': company_info.get('foundedOn', {}).get('year'),
                    'specialties': company_info.get('specialities', []),
                }
                print(f"LinkedIn information found for: {linkedin_info['name']}")
                return linkedin_info
        except Exception as e:
            print(f"An error occurred while searching LinkedIn: {str(e)}")
        print("No LinkedIn information found or timeout occurred")
        return None

    def run(self, url):
        print(f"Starting entity summarization process for URL: {url}")
        html = self.fetch_webpage(url)
        if html:
            text = self.extract_text(html)
            entity_info = self.summarize_entity(text)
            if entity_info:
                yelp_result = self.search_yelp(entity_info['entity_name'])
                google_maps_info = self.get_google_maps_info(entity_info['entity_name'], "New York City")
                linkedin_info = self.search_linkedin_company(entity_info['entity_name'])
                
                print("Creating new entity log")
                create_new_entity_log(
                    url=url,
                    name=entity_info['entity_name'],
                    summary=entity_info['summary'],
                    yelp_data=yelp_result,
                    google_maps_data=google_maps_info,
                    linked_in_data=linkedin_info
                )
                print("Entity summarization process completed")
            else:
                print("Failed to summarize entity")
        else:
            print("Failed to fetch webpage")

if __name__ == "__main__":
    url = "https://levainbakery.com/"
    summarizer = EntitySummarizer()
    summarizer.run(url)