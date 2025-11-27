# Arnab Chanda - Portfolio & Blog

A modern, fast, and responsive portfolio and blog website built with Jekyll. Features a cyberpunk/matrix aesthetic with green on dark theme.

## 🚀 Features

- **Static Blog**: Write posts in Markdown with full Jekyll support
- **Portfolio/About Page**: Showcase your experience and skills
- **Bookshelf Integration**: Display books from Open Library
- **Responsive Design**: Works beautifully on all devices
- **Fast & Secure**: Static site generation for optimal performance
- **SEO Optimized**: Built-in SEO tags and sitemap generation
- **Matrix Theme**: Cyberpunk aesthetic with animated binary background

## 📁 Project Structure

```
arnie09.github.io/
├── _config.yml           # Site configuration
├── _layouts/             # Page templates
│   ├── default.html
│   ├── home.html
│   ├── post.html
│   ├── blog.html
│   └── bookshelf.html
├── _includes/            # Reusable components
│   ├── header.html
│   └── footer.html
├── _posts/               # Blog posts (Markdown)
├── assets/               # Static assets
│   ├── css/
│   │   └── main.css
│   ├── js/
│   │   ├── main.js
│   │   └── bookshelf.js
│   └── images/
├── index.md              # Homepage
├── blog.md               # Blog listing page
├── bookshelf.md          # Bookshelf page
├── CNAME                 # Custom domain (arnie09.xyz)
├── Gemfile               # Ruby dependencies
└── README.md             # This file
```

## 🚀 Quick Start

```bash
# Install dependencies
bundle install

# Start development server with live reload
bundle exec jekyll serve --livereload

# Visit http://localhost:4000
```

## 🛠️ Installation

### Prerequisites

- Ruby (version 2.7 or higher)
- RubyGems
- GCC and Make

### Ubuntu/WSL Setup

```bash
# Install Ruby and dependencies
sudo apt update
sudo apt install ruby-full build-essential zlib1g-dev

# Configure gem path
echo 'export GEM_HOME="$HOME/gems"' >> ~/.bashrc
echo 'export PATH="$HOME/gems/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc

# Install Jekyll
gem install jekyll bundler
```

### Run the Site

1. **Install dependencies:**

```bash
bundle install
```

2. **Start the development server:**

```bash
bundle exec jekyll serve --livereload
```

3. **Open your browser:**

Navigate to `http://localhost:4000`

### Build for Production

```bash
bundle exec jekyll build
```

The built site will be in the `_site` directory.

## ✍️ Writing Blog Posts

Create a new file in `_posts/` with the format: `YYYY-MM-DD-title.md`

```markdown
---
layout: post
title: "Your Post Title"
date: 2024-11-27 10:00:00 +0000
categories: [category1, category2]
tags: [tag1, tag2, tag3]
---

Your content here in Markdown...
```

### Front Matter Options

- `layout`: Usually `post` for blog posts
- `title`: Post title
- `date`: Publication date and time
- `categories`: List of categories
- `tags`: List of tags
- `author`: Author name (optional)

## 🎨 Customization

### Update Site Information

Edit `_config.yml`:

```yaml
title: Your Name
email: your.email@example.com
description: Your description
github_username: yourusername
linkedin_username: yourlinkedin
```

### Modify Colors

Edit `assets/css/main.css` and update CSS variables:

```css
:root {
    --primary-color: #00ff00;
    --bg-dark: #121212;
    --bg-light: #1a1a1a;
    --text-primary: #00ff00;
    --text-secondary: #888;
    --border-color: rgba(0, 255, 0, 0.2);
}
```

### Update Bookshelf

Edit `assets/js/bookshelf.js` and change the Open Library username:

```javascript
const url = `${OPENLIBRARY_BASE_URL}/people/YOUR_USERNAME/books/${endpoint}.json`;
```

## 📱 Responsive Design

The site is fully responsive with breakpoints at:
- Desktop: > 768px
- Mobile: ≤ 768px

## 🚀 Deployment

### GitHub Pages

1. Push your code to a GitHub repository named `username.github.io`
2. Enable GitHub Pages in repository settings
3. Your site will be available at `https://username.github.io`

### Netlify

1. Connect your GitHub repository to Netlify
2. Build command: `jekyll build`
3. Publish directory: `_site`

### Custom Domain

Add a `CNAME` file in the root directory with your domain name.

## 🔧 Troubleshooting

### Jekyll not found

```bash
gem install jekyll bundler
```

### Permission errors

```bash
sudo gem install jekyll bundler
```

### Bundle install fails

```bash
bundle update
bundle install
```

## 📝 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Feel free to fork this project and customize it for your own use!

## 📧 Contact

Arnab Chanda - [arnabchanda964@gmail.com](mailto:arnabchanda964@gmail.com)

---

Built with ❤️ using Jekyll

