# Security Policy

## Supported Versions

We release patches for security vulnerabilities in the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take the security of PM2 UI seriously. If you believe you have found a security vulnerability, please report it to us responsibly.

### How to Report

**Please do NOT report security vulnerabilities through public GitHub issues.**

Instead, please report them via one of the following methods:

1. **Email**: Send details to the project maintainers (update with actual email)
2. **GitHub Security Advisories**: Use the "Report a vulnerability" button in the Security tab

### What to Include

Please include the following information in your report:

- Type of vulnerability
- Full paths of source file(s) related to the manifestation of the vulnerability
- The location of the affected source code (tag/branch/commit or direct URL)
- Any special configuration required to reproduce the issue
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the issue, including how an attacker might exploit it

### Response Timeline

- **Initial Response**: Within 48 hours
- **Assessment**: Within 1 week
- **Fix & Disclosure**: Coordinated with reporter

### What to Expect

1. We will acknowledge receipt of your vulnerability report
2. We will confirm the vulnerability and determine its impact
3. We will release a fix as soon as possible depending on complexity
4. We will publicly disclose the vulnerability after a fix is released

## Security Best Practices

When using PM2 UI in production, we recommend:

### Authentication

PM2 UI does not include authentication by default. For production use:

- Deploy behind a reverse proxy with authentication (e.g., nginx with Basic Auth)
- Use a VPN or private network
- Implement application-level authentication (contributions welcome!)

### Network Security

- **Firewall**: Restrict access to the PM2 UI port (default: 3030)
- **HTTPS**: Use a reverse proxy (nginx, Caddy) to add TLS encryption
- **Private Network**: Deploy on a private network when possible

### Configuration

- **Environment Variables**: Store sensitive configuration in environment variables
- **File Permissions**: Ensure `.env` and `config.json` have appropriate permissions (600)
- **PM2 Access**: Ensure PM2 daemon runs with appropriate user permissions

### Updates

- Keep PM2 UI updated to the latest version
- Monitor security advisories
- Update dependencies regularly: `npm audit` and `npm update`

### Dependencies

We regularly scan dependencies for known vulnerabilities:

```bash
# Check for vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix
```

## Known Security Limitations

### Current Limitations

1. **No Built-in Authentication**: Users must implement their own authentication or use a reverse proxy
2. **WebSocket Security**: WebSocket connections are not encrypted by default
3. **Process Control**: Full access to start/stop/restart PM2 processes
4. **Log Access**: Can read all PM2 process logs

### Mitigation

- Use network-level security controls
- Deploy in trusted environments only
- Consider implementing authentication (see Roadmap)

## Security Roadmap

Planned security enhancements:

- [ ] Built-in authentication system
- [ ] Role-based access control (RBAC)
- [ ] Audit logging
- [ ] Rate limiting
- [ ] CSRF protection
- [ ] Session management
- [ ] API key authentication

## Security Updates

Security updates will be released as patch versions and announced via:

- GitHub Security Advisories
- Release notes
- GitHub Releases page

Subscribe to releases to stay informed about security updates.

## Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [npm Security Advisories](https://www.npmjs.com/advisories)

## Credits

We appreciate security researchers and users who help keep PM2 UI secure by responsibly disclosing vulnerabilities.

## License

This security policy is licensed under the same MIT license as the project.