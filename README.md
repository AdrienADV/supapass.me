<div align="center">
<img src="web/public/supabase.svg" alt="SupaPass Logo" width="40" height="40">

  # SupaPass
  
  **Your Supabase contributions deserve recognition - Get your personalized Apple Wallet pass based on your GitHub contributions to Supabase**
</div>

![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge) ![TypeScript](https://img.shields.io/badge/TypeScript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white) ![React](https://img.shields.io/badge/React-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB) ![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-000000?style=for-the-badge&logo=shadcnui&logoColor=white) ![AdonisJS](https://img.shields.io/badge/AdonisJS-%236e4aff.svg?style=for-the-badge&logo=adonisjs&logoColor=white) ![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)

## What is SupaPass?

SupaPass is a **community-driven project** that celebrates and recognizes your contributions to the Supabase ecosystem. By analyzing your GitHub activity on Supabase repositories, we generate a beautiful, personalized **Apple Wallet pass** that showcases your open source impact.

Whether you're a seasoned contributor or just getting started, SupaPass transforms your GitHub contributions into a tangible badge of honor that you can carry in your digital wallet.

## Features

**GitHub Analysis**: Scans your contributions to Supabase repositories, counts pull requests, issues, and code reviews. Updates weekly to reflect new contributions.

**Apple Wallet Pass**: Creates .pkpass files for Apple Wallet with different designs based on contribution level (Bronze, Silver, Gold, Core Member). Works offline once added to your wallet.

**Web Pass**: Generates a shareable web page of your pass that can be downloaded as PNG for sharing on social media.

## Installation

### Prerequisites

- Node.js 20+ 
- NPM
- Supabase account
- GitHub OAuth App
- Apple Developer certificates (for .pkpass generation)

### Clone the Repository

```bash
git clone https://github.com/adrienadv/supapass.me.git
cd supapass.me
```

### Backend Setup

1. Navigate to the API directory:
```bash
cd api
```

2. Install dependencies:
```bash
npm install
```

3. Create and configure environment file:
```bash
cp .env.example .env
```

4. Start the API server:
```bash
npm run dev
```

### Frontend Setup

1. Navigate to the web directory:
```bash
cd ../web
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Configure environment variables in `.env`:

5. Start the development server:
```bash
npm run dev
```

### Database Setup

1. Create a Supabase project
2. Run the SQL migrations in your Supabase dashboard
3. Set up GitHub OAuth in Supabase Auth settings

The application will be available at:
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3333`

## Usage

### For Users

1. **Visit the application** at `http://localhost:5173`
2. **Click "Get Started"** to begin the authentication process
3. **Login with GitHub** using OAuth
4. **Wait for analysis** - the app will scan your Supabase contributions
5. **Download your pass** - add it to Apple Wallet or save the web version

## Contributing

We welcome contributions from the community! Here's how you can help:

### How to Contribute

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/your-feature-name`
3. **Make your changes** and test them locally
4. **Commit your changes**: `git commit -m "Add your feature description"`
5. **Push to your branch**: `git push origin feature/your-feature-name`
6. **Open a Pull Request** with a clear description of your changes

### Reporting Issues

Found a bug or have a suggestion? Please open an issue on GitHub with:
- Clear description of the problem or suggestion
- Steps to reproduce (for bugs)
- Expected vs actual behavior
- Your environment details

## License & Credits

### License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.