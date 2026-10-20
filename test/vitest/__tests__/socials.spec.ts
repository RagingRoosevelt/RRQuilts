import { describe, expect, it } from 'vitest';
import { socialLink, toHandle } from '@/settings/socials';

describe('socials', () => {
  it('reduces known sites’ links to handles; keeps Website and custom types as typed', () => {
    expect(toHandle('GitHub', 'https://github.com/jane-doe')).toBe('jane-doe');
    expect(toHandle('GitHub', '@jane')).toBe('jane');
    expect(toHandle('Twitter / X', 'x.com/jane/status/1')).toBe('jane');
    expect(toHandle('YouTube', 'https://www.youtube.com/@JaneQuilts')).toBe('JaneQuilts');
    expect(toHandle('Bluesky', 'https://bsky.app/profile/jane.bsky.social')).toBe(
      'jane.bsky.social',
    );
    expect(toHandle('Mastodon', 'https://mastodon.social/@jane')).toBe('@jane@mastodon.social');
    expect(toHandle('Website', 'https://jane.example/quilts')).toBe('https://jane.example/quilts');
    expect(toHandle('My guild', 'https://guild.example/jane')).toBe('https://guild.example/jane');
    expect(toHandle('GitHub', 'https://gitlab.com/jane')).toBe('https://gitlab.com/jane');
    expect(toHandle('Threadloop', 'https://threadloop.app/members/ragingroosevelt')).toBe(
      'ragingroosevelt',
    );
    expect(toHandle('Printables', 'https://www.printables.com/@RagingRoosevelt')).toBe(
      'RagingRoosevelt',
    );
    expect(toHandle('Ravelry', 'https://www.ravelry.com/people/RagingRoosevelt')).toBe(
      'RagingRoosevelt',
    );
    expect(socialLink({ type: 'Threadloop', handle: 'ragingroosevelt' })).toBe(
      'https://threadloop.app/members/ragingroosevelt',
    );
  });
});
