# Builder.io Sync Documentation

This document explains how to sync CS2 item data from the ByMykel API to Builder.io.

## Prerequisites

1. **Builder.io Account** with Admin API access
2. **Private API Key** from Builder.io
3. **Data Models** created in Builder.io (see Data Models section)

## Setup

### 1. Environment Configuration

Copy the example environment file and add your API key:

```bash
cp .env.example .env
```

Edit `.env` and add your Builder.io private API key:

```env
BUILDER_API_KEY=bpk-your-private-api-key-here
```

### 2. Create Data Models in Builder.io

You need to create the following models in your Builder.io space:

#### Skin Model

- **Name**: `skin`
- **Fields**:
  - `id` (text, required)
  - `name` (text, required)
  - `weapon` (text)
  - `rarity` (text)
  - `min_float` (number)
  - `max_float` (number)
  - `image` (url)
  - `collections` (list of text)
  - `souvenir` (boolean)
  - `stattrak` (boolean)
  - `pattern` (text)
  - `finish_catalog` (text)

#### Agent Model

- **Name**: `agent`
- **Fields**:
  - `id` (text, required)
  - `name` (text, required)
  - `rarity` (text)
  - `team` (text)
  - `image` (url)
  - `collections` (list of text)

#### Sticker Model

- **Name**: `sticker`
- **Fields**:
  - `id` (text, required)
  - `name` (text, required)
  - `rarity` (text)
  - `image` (url)
  - `collections` (list of text)
  - `tournament` (text)
  - `type` (text)

#### Other Models

Similarly create models for:

- `patch` (patches)
- `keychain` (keychains)
- `graffiti` (graffiti)
- `music_kit` (music kits)
- `item` (general items/containers)

## Usage

### Basic Sync

```bash
npm run sync:builder
```

This will:

1. Fetch all item data from ByMykel API
2. Normalize the data for each item type
3. Skip items that already exist in Builder.io
4. Upload new items with rate limiting (100ms between requests)
5. Process items in batches of 50

### Force Sync (Skip Duplicate Check)

```bash
npm run sync:builder:force
```

This skips the duplicate checking and attempts to upload all items.

### Manual Script Execution

```bash
node scripts/sync-to-builder.js
```

## Configuration Options

You can customize the sync process by setting environment variables:

```env
# Rate limiting
DELAY_MS=100          # Milliseconds between requests
BATCH_SIZE=50         # Items per batch

# Retry configuration
MAX_RETRIES=3         # Number of retries for failed requests
RETRY_DELAY=1000      # Base delay between retries (ms)

# API configuration
BUILDER_BASE_URL=https://builder.io/api/v1/write
```

## Data Structure Examples

### Skin Item

```json
{
  "id": "skin-408",
  "name": "AK-47 | Redline",
  "weapon": "AK-47",
  "rarity": "Classified",
  "min_float": 0.1,
  "max_float": 0.7,
  "image": "https://...",
  "collections": ["The Phoenix Collection"],
  "souvenir": false,
  "stattrak": true,
  "pattern": "Redline",
  "finish_catalog": "408"
}
```

### Agent Item

```json
{
  "id": "agent-4613",
  "name": "Bloody Darryl The Strapped | The Professionals",
  "rarity": "Superior",
  "team": "Terrorist",
  "image": "https://...",
  "collections": ["Operation Riptide Agents"]
}
```

## Monitoring and Logs

### Log Files

- **Main log**: `logs/builder-sync.log`
- **Error report**: `logs/sync-errors.json`
- **Cache file**: `cache/all-items.json`

### Log Levels

- `INFO`: General information
- `WARN`: Warnings (retries, fallbacks)
- `ERROR`: Errors that don't stop the process
- `DEBUG`: Detailed debugging information

## Error Handling

The script includes comprehensive error handling:

1. **Network Errors**: Automatic retries with exponential backoff
2. **Rate Limiting**: Built-in delays between requests
3. **API Errors**: Detailed error logging and reporting
4. **Data Validation**: Checks for required fields
5. **Caching**: Falls back to cached data if API is unavailable

## Performance

### Expected Processing Time

- **~10,000 items**: 20-30 minutes
- **Rate**: ~6-10 items per second (with rate limiting)

### Optimization Tips

1. Use `--skip-existing` to avoid uploading duplicates
2. Increase `BATCH_SIZE` for faster processing (but watch rate limits)
3. Run during off-peak hours for better API performance

## Troubleshooting

### Common Issues

1. **Authentication Error**

   ```
   Error: HTTP 401: Unauthorized
   ```

   - Check your `BUILDER_API_KEY` in `.env`
   - Ensure you're using a **Private API Key**, not Public

2. **Model Not Found**

   ```
   Error: HTTP 404: Model 'skin' not found
   ```

   - Create the data model in Builder.io first
   - Check model name matches exactly

3. **Rate Limiting**

   ```
   Error: HTTP 429: Too Many Requests
   ```

   - Increase `DELAY_MS` in configuration
   - The script will automatically retry

4. **Field Validation Error**
   ```
   Error: Invalid field value
   ```
   - Check that your Builder.io model fields match the data structure
   - Ensure required fields are marked correctly

### Debug Mode

Add debug logging:

```bash
DEBUG=* node scripts/sync-to-builder.js
```

## API Rate Limits

Builder.io has rate limits on their Admin API:

- **Standard**: ~10 requests/second
- **Enterprise**: Higher limits available

The script automatically handles rate limiting with:

- 100ms delay between requests (configurable)
- Exponential backoff on retries
- Batch processing to manage load

## Security Notes

- Never commit your `.env` file with real API keys
- Use environment variables in production
- Rotate API keys regularly
- Monitor API usage in Builder.io dashboard

## Support

If you encounter issues:

1. Check the logs in `logs/` directory
2. Verify your Builder.io model structure
3. Test with a small batch first
4. Review the error report in `logs/sync-errors.json`
