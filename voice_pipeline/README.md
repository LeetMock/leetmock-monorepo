# Voice Pipeline

View the latest architecture at [here](https://lucid.app/lucidchart/44141db5-9cf7-40df-a2ab-d239a31d9044/edit?invitationId=inv_8b2894b3-a0a5-490c-a3a4-e12a05ed1470)

Updates to the architecture will be made in the Lucidchart document.

# Run Locally

```
# cd to the root of the project (where the README.md file is)
uvicorn --port 5050 voice_pipeline.main:app --reload --log-level info
```