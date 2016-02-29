# Keep the Azure Search index for your hosted Ghost blog up to date

This repo contains the code of a simple API that allows you to keep the Azure Search index for your hosted Ghost blog up to date.

## Prerequisites

- Hosted Ghost blog
- Azure Search index created using the scripts from https://github.com/waldekmastykarz/ghost-azure-search

## Getting this API to work

1. In your Azure Subscription create a new API App
1. In the **Publication settings** configure **Continuous deployment** using a local Git repo
1. Clone this repo
1. Add the remote Git URL of your API App as a remote to the cloned repo
1. Push the repo to your Azure Git URL

Additional information about using this API with a hosted Ghost blog can be found at https://blog.mastykarz.nl/azure-search-index-hosted-ghost-blog-up-to-date/
