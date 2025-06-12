import requests
from bs4 import BeautifulSoup
import mysql.connector
import os
import openai
from dotenv import load_dotenv
load_dotenv()

client = openai.OpenAI(api_key="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")

DB_CONFIG = {
    "host": "localhost",
    "user": "cyberlaw_user",
    "password": "securepassword",
    "database": "cyberlawdb"
}

LAW_URLS = [
    "https://www.law.cornell.edu/uscode/text/6/chapter-6",
    "https://www.law.cornell.edu/uscode/text/15/chapter-94",
    "https://www.law.cornell.edu/uscode/text/18/part-I/chapter-47"
]

def generate_description(title, url):
    prompt = f"Write a concise description for the U.S. law titled '{title}'. You can reference details from: {url}"
    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=80,
            temperature=0.7,
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"OpenAI error for {title}: {e}")
        return ""
    
def fetch_laws(url):
    headers = {"User-Agent": "Mozilla/5.0"}
    resp = requests.get(url, headers=headers)
    soup = BeautifulSoup(resp.text, "html.parser")

    subchapter_links = []
    for a in soup.select("ol.list-unstyled li.tocitem a"):
        subchapter_links.append("https://www.law.cornell.edu" + a['href'])

    laws = []
    for sub_url in subchapter_links:
        sub_resp = requests.get(sub_url, headers=headers)
        sub_soup = BeautifulSoup(sub_resp.text, "html.parser")
        for a in sub_soup.select("ol.list-unstyled li.tocitem a"):
            title = a.get_text(strip=True)
            law_url = "https://www.law.cornell.edu" + a['href']
            desc = generate_description(title, law_url)
            laws.append({
                "title": title,
                "category": "Compliance",
                "description": desc,
                "citation": f'"{title}." Cornell Law School, {law_url}',
                "url": law_url
            })
    return laws

def insert_laws(laws):
    conn = mysql.connector.connect(**DB_CONFIG)
    cursor = conn.cursor()
    for law in laws:
        cursor.execute("""
            INSERT INTO us_cybersecurity_laws (title, category, description, citation, url)
            VALUES (%s, %s, %s, %s, %s)
            ON DUPLICATE KEY UPDATE title=VALUES(title)
        """, (law["title"], law["category"], law["description"], law["citation"], law["url"]))
    conn.commit()
    cursor.close()
    conn.close()

if __name__ == "__main__":
    all_laws = []
    for url in LAW_URLS:
        print(f"Fetching from {url}")
        all_laws.extend(fetch_laws(url))
    print(f"Fetched {len(all_laws)} laws.")

    # Print as SQL value tuples for manual DB insertion
    values = []
    for idx, law in enumerate(all_laws, start=1):
        # Escape single quotes for SQL
        title = law["title"].replace("'", "''")
        category = law["category"].replace("'", "''")
        description = law["description"].replace("'", "''")
        citation = law["citation"].replace("'", "''")
        url = law["url"].replace("'", "''")
        values.append(f"({idx},'{title}','{category}','{description}','{citation}','{url}')")
    print(",".join(values))