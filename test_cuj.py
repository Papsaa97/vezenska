from playwright.sync_api import sync_playwright
import os

def run_cuj(page):
    page.goto("http://localhost:3000")
    page.wait_for_timeout(2000)

    # Click on Banka otázek (Manager)
    # Using locator based on what might be in the nav
    try:
        page.get_by_role("button", name="Banka otázek").click()
    except Exception:
        try:
           page.get_by_text("Banka otázek").click()
        except Exception:
           print("Could not find Banka otázek, trying to capture screen anyway.")

    page.wait_for_timeout(1000)

    # Try clicking on one of the new buttons
    try:
        page.get_by_text("Doplnit chybějící").click()
    except Exception:
        print("Could not find import button")

    page.wait_for_timeout(1000)

    page.screenshot(path="/home/jules/verification/screenshots/verification.png")
    page.wait_for_timeout(1000)

if __name__ == "__main__":
    os.makedirs("/home/jules/verification/screenshots", exist_ok=True)
    os.makedirs("/home/jules/verification/videos", exist_ok=True)
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            record_video_dir="/home/jules/verification/videos"
        )
        page = context.new_page()
        try:
            run_cuj(page)
        finally:
            context.close()
            browser.close()
