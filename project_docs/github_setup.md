---
description: How to push the Gift Card Calculator to a new GitHub repository
---

# Push to GitHub

Follow these steps to save your project to a new GitHub repository.

## 1. Create Repository on GitHub
1.  Go to [github.com/new](https://github.com/new).
2.  Enter a repository name (e.g., `gift-card-optimiser`).
3.  Click **Create repository**.

## 2. Connect and Push
Copy the commands shown on GitHub under "…or push an existing repository from the command line" and run them in your terminal. They will look like this:

```bash
git remote add origin https://github.com/YOUR_USERNAME/gift-card-optimiser.git
git branch -M main
git push -u origin main
```

> [!NOTE]
> I have already initialized the local repository and committed your files. You just need to connect the remote and push.

> [!NOTE]
> Replace `YOUR_USERNAME` and `gift-card-optimiser` with your actual GitHub username and repository name.
