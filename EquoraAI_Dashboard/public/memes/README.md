# Finance Memes Directory

This directory contains meme images used in the Finance Memes component of the dashboard.

## Required Images

Please save the following images in this directory with the exact filenames:

1. `month-end-close.jpg` - The "Success Kid" meme with caption "WHEN YOU FINALLY FINISH MONTH-END CLOSE"
2. `risky-investment-dad.jpg` - Meme showing a dad's reaction after a risky investment
3. `market-crash-divorce.jpg` - Meme comparing stock market crash to divorce
4. `interstellar-hdfc.jpg` - Interstellar movie scene with caption about HDFC stock
5. `52-week-low.jpg` - Bollywood scene showing reaction when stocks reach 104-week low

## How to Add Images

1. Simply save the images with the exact filenames above in this directory
2. Make sure the images are in JPG format
3. Recommended size: around 800x500 pixels for optimal display

The FinanceMemes component is set up to automatically load these images from the `/memes/` directory.

## Adding More Memes

To add more memes to the carousel:
1. Save your image in this directory
2. Edit the `memesData` array in `src/components/dashboard/FinanceMemes.tsx`
3. Add a new entry with a unique ID, image path, caption, and engagement metrics 