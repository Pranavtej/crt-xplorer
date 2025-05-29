# CRT Explorer

CRT Explorer is a modern web application for exploring, analyzing, and comparing SSL/TLS certificates for websites. Built with Next.js, TypeScript, and Tailwind CSS, this tool provides detailed certificate information, security assessments, and comparison capabilities.

## Features

- **Certificate Fetching**: Enter any domain name to fetch and analyze its SSL/TLS certificate
- **Certificate Analysis**: View detailed information about certificates, including issuer, validity period, domains covered, and more
- **Security Assessment**: Get a security score and detailed analysis of certificate security features
- **Timeline Visualization**: Visual representation of the certificate validity period
- **Certificate Comparison**: Add multiple certificates to compare their properties side by side
- **Export Functionality**: Export certificate data as JSON for further analysis
- **Recent Search History**: Quick access to previously viewed certificates

## Technical Details

CRT Explorer is built with the following technologies:

- **Frontend**:
  - Next.js 14+
  - React 18+
  - TypeScript
  - Tailwind CSS
  - Lucide Icons
  - shadcn/ui components

- **Backend**:
  - Next.js API routes
  - Node.js TLS module for certificate fetching
  - node-forge for certificate parsing

## Getting Started

### Prerequisites

- Node.js 18.0 or higher
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/crt-xplorer.git
cd crt-xplorer
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Start the development server:
```bash
npm run dev
# or
yarn dev
```

4. Open your browser and navigate to `http://localhost:3000` to use the application.

## Usage

1. Enter a domain name (e.g., example.com) in the search field
2. Click "Fetch Certificate" or press Enter
3. View the certificate details in the various tabs
4. Add certificates to comparison by clicking "Compare"
5. Export certificates as JSON by clicking "Export"

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Lucide Icons](https://lucide.dev/)
- [node-forge](https://github.com/digitalbazaar/forge)
