from playwright.sync_api import sync_playwright
import time

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    page.goto("http://localhost:5000/")

    # Wait for the header to load
    page.wait_for_selector("[data-testid='link-logo']", timeout=60000)

    # Give the map some extra time to load
    time.sleep(10)

    # Take a screenshot
    page.screenshot(path="/app/verification/verification.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
