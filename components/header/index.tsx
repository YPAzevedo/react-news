import Image from 'next/image';
import Link from 'next/link';

import { SignInButton } from '../SignInButton';

import styles from './header.module.scss';

export function Header() {
  return (
    <header className={styles.container}>
      <div className={styles.content}>
        <Image src="/images/logo.svg" alt="Logo" width="100" height="40" />

        <nav>
          <Link href="/" passHref>
            <a className={styles.active}>Home</a>
          </Link>
          <Link href="/posts" passHref>
            <a>Posts</a>
          </Link>
        </nav>

        <SignInButton />
      </div>
    </header>
  );
}
