import { FaGithub } from 'react-icons/fa';
import { FiX } from 'react-icons/fi';
import { signIn, signOut, useSession } from 'next-auth/client';

import styles from './signinbutton.module.scss';

export function SignInButton() {
  const [session] = useSession();

  if (session?.user) {
    return (
      <button type="button" className={styles.button} onClick={() => signOut()}>
        <FaGithub fill="#04D361" />
        <span>{session.user.name}</span>
        <FiX fill="#737380" className={styles.closeIcon} />
      </button>
    );
  }

  return (
    <button
      type="button"
      className={styles.button}
      onClick={() => signIn('github')}
    >
      <FaGithub fill="#EBA417" />
      <span>Sign in with GitHub</span>
    </button>
  );
}
