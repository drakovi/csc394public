import requests
from bs4 import BeautifulSoup

url = "https://www.law.cornell.edu/uscode/text/6/chapter-6"

def fetch_laws():
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
            desc = ""
            try:
                law_resp = requests.get(law_url, headers=headers)
                law_soup = BeautifulSoup(law_resp.text, "html.parser")
                desc_tag = law_soup.find("meta", {"name": "description"})
                if desc_tag:
                    desc = desc_tag.get("content", "")
            except Exception:
                pass
            laws.append({
                "title": title,
                "category": "Compliance",
                "description": desc,
                "citation": f'"{title}." Cornell Law School, {law_url}',
                "url": law_url
            })
    return laws

if __name__ == "__main__":
    laws = fetch_laws()
    print(f"Fetched {len(laws)} laws.")
    for law in laws[:5]:
        print(f"Title: {law['title']}")
        print(f"URL: {law['url']}")
        print(f"Description: {law['description']}\n")

'''import requests
from bs4 import BeautifulSoup
import mysql.connector

url = "https://www.law.cornell.edu/uscode/text/6/chapter-6"
DB_CONFIG = {
    "host": "localhost",
    "user": "cyberlaw_user",
    "password": "securepassword",
    "database": "cyberlawdb"
}

def fetch_laws():
    headers = {"User-Agent": "Mozilla/5.0"}
    resp = requests.get(url, headers=headers)
    soup = BeautifulSoup(resp.text, "html.parser")

    # Step 1: Get all subchapter links
    subchapter_links = []
    for a in soup.select("ol.list-unstyled li.tocitem a"):
        subchapter_links.append("https://www.law.cornell.edu" + a['href'])

    laws = []
    # Step 2: For each subchapter, get all section links
    for sub_url in subchapter_links:
        sub_resp = requests.get(sub_url, headers=headers)
        sub_soup = BeautifulSoup(sub_resp.text, "html.parser")
        for a in sub_soup.select("ul.sectno-list li a"):
            title = a.get_text(strip=True)
            law_url = "https://www.law.cornell.edu" + a['href']
            desc = ""
            try:
                law_resp = requests.get(law_url, headers=headers)
                law_soup = BeautifulSoup(law_resp.text, "html.parser")
                desc_tag = law_soup.find("meta", {"name": "description"})
                if desc_tag:
                    desc = desc_tag.get("content", "")
            except Exception:
                pass
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
    laws = fetch_laws()
    print(f"Fetched {len(laws)} laws.")
    insert_laws(laws)
    print("Inserted into database.")
    '''