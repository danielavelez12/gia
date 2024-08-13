import os
import requests
from bs4 import BeautifulSoup
from dotenv import load_dotenv
import anthropic

# Load environment variables
load_dotenv()

class BusinessSummarizer:
    def __init__(self):
        self.anthropic_api_key = os.getenv("ANTHROPIC_API_KEY")
        self.client = anthropic.Anthropic(api_key=self.anthropic_api_key)

    def fetch_webpage(self, url):
        response = requests.get(url)
        if response.status_code == 200:
            return response.text
        else:
            raise Exception(f"Failed to fetch the page. Status code: {response.status_code}")

    def extract_text(self, html):
        soup = BeautifulSoup(html, 'html.parser')
        # Remove script and style elements
        for script in soup(["script", "style"]):
            script.decompose()
        text = soup.get_text()
        # Break into lines and remove leading and trailing space on each
        lines = (line.strip() for line in text.splitlines())
        # Break multi-headlines into a line each
        chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
        # Drop blank lines
        text = '\n'.join(chunk for chunk in chunks if chunk)
        return text

    def summarize_business(self, text):
        prompt = f"""\n\nHuman: Please provide a concise summary of the following business based on the extracted webpage content. 
        Focus on key information such as the business name, type of business, main products or services, and any standout features or claims.
        
        Extracted content:
        {text[:10000]}  # Limit to first 10000 characters to stay within token limits
        
        Summary:\n\nAssistant:"""

        response = self.client.completions.create(
            model="claude-2.1",
            prompt=prompt,
            max_tokens_to_sample=300,
        )
        return response.completion

    def run(self, url):
        html = self.fetch_webpage(url)
        text = self.extract_text(html)
        summary = self.summarize_business(text)
        return summary

# Usage
if __name__ == "__main__":
    # url = input("Enter the business website URL: ")
    url = "https://www.apple.com"
    summarizer = BusinessSummarizer()
    summary = summarizer.run(url)
    print("\nBusiness Summary:")
    print(summary)