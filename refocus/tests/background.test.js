const { matchesBlockedSite } = require('../background.js');

describe('background.js', () => {
    describe('matchesBlockedSite', () => {
        test('matches exact domain', () => {
            expect(matchesBlockedSite('twitter.com', 'twitter.com')).toBe(true);
            expect(matchesBlockedSite('facebook.com', 'twitter.com')).toBe(false);
        });

        test('matches subdomains', () => {
            expect(matchesBlockedSite('mail.google.com', 'google.com')).toBe(true);
            expect(matchesBlockedSite('docs.google.com', 'google.com')).toBe(true);
            expect(matchesBlockedSite('google.com', 'google.com')).toBe(true);
        });

        test('matches wildcard patterns', () => {
            expect(matchesBlockedSite('mail.google.com', '*.google.com')).toBe(true);
            expect(matchesBlockedSite('docs.google.com', '*.google.com')).toBe(true);
            expect(matchesBlockedSite('google.com', '*.google.com')).toBe(true);
        });

        test('does not match different domains', () => {
            expect(matchesBlockedSite('google.com', 'facebook.com')).toBe(false);
            expect(matchesBlockedSite('twitter.com', 'google.com')).toBe(false);
        });

        test('handles null/undefined hostname', () => {
            expect(matchesBlockedSite(null, 'google.com')).toBe(false);
            expect(matchesBlockedSite(undefined, 'google.com')).toBe(false);
            expect(matchesBlockedSite('', 'google.com')).toBe(false);
        });

        test('handles special regex characters in domain', () => {
            expect(matchesBlockedSite('test.example.com', 'example.com')).toBe(true);
            expect(matchesBlockedSite('test-site.com', 'test-site.com')).toBe(true);
        });

        test('does not match partial domain names', () => {
            // Should not match "google.com" when pattern is "oogle.com"
            expect(matchesBlockedSite('google.com', 'oogle.com')).toBe(false);
            // Should not match "example.com" when pattern is "ample.com"
            expect(matchesBlockedSite('example.com', 'ample.com')).toBe(false);
        });

        test('matches complex subdomain structures', () => {
            expect(matchesBlockedSite('a.b.c.example.com', 'example.com')).toBe(true);
            expect(matchesBlockedSite('deep.nested.subdomain.site.com', 'site.com')).toBe(true);
        });
    });
});
