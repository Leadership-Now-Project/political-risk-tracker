const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';
const GITHUB_REPO = process.env.GITHUB_REPO || '';

const API_BASE = 'https://api.github.com';

interface GitHubFileResponse {
  content: string;
  sha: string;
  encoding: string;
}

function headers() {
  return {
    Authorization: `Bearer ${GITHUB_TOKEN}`,
    Accept: 'application/vnd.github.v3+json',
    'Content-Type': 'application/json',
  };
}

export async function readFile(path: string): Promise<{ content: string; sha: string }> {
  const res = await fetch(`${API_BASE}/repos/${GITHUB_REPO}/contents/${path}`, {
    headers: headers(),
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`GitHub API error reading ${path}: ${res.status} ${res.statusText}`);
  }

  const data: GitHubFileResponse = await res.json();
  const content = Buffer.from(data.content, 'base64').toString('utf-8');
  return { content, sha: data.sha };
}

export async function writeFile(
  path: string,
  content: string,
  message: string,
  sha?: string
): Promise<void> {
  // If no SHA provided, try to get current file SHA
  let fileSha = sha;
  if (!fileSha) {
    try {
      const existing = await readFile(path);
      fileSha = existing.sha;
    } catch {
      // File doesn't exist yet, that's fine for creation
    }
  }

  const body: Record<string, string> = {
    message,
    content: Buffer.from(content).toString('base64'),
  };
  if (fileSha) {
    body.sha = fileSha;
  }

  const res = await fetch(`${API_BASE}/repos/${GITHUB_REPO}/contents/${path}`, {
    method: 'PUT',
    headers: headers(),
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`GitHub API error writing ${path}: ${res.status} ${errorBody}`);
  }
}

interface FileUpdate {
  path: string;
  content: string;
}

export async function commitMultipleFiles(
  files: FileUpdate[],
  message: string
): Promise<void> {
  // 1. Get the latest commit SHA on the default branch
  const refRes = await fetch(`${API_BASE}/repos/${GITHUB_REPO}/git/ref/heads/main`, {
    headers: headers(),
    cache: 'no-store',
  });
  if (!refRes.ok) throw new Error(`Failed to get ref: ${refRes.status}`);
  const refData = await refRes.json();
  const latestCommitSha = refData.object.sha;

  // 2. Get the tree SHA from the latest commit
  const commitRes = await fetch(`${API_BASE}/repos/${GITHUB_REPO}/git/commits/${latestCommitSha}`, {
    headers: headers(),
  });
  if (!commitRes.ok) throw new Error(`Failed to get commit: ${commitRes.status}`);
  const commitData = await commitRes.json();
  const baseTreeSha = commitData.tree.sha;

  // 3. Create blobs for each file
  const tree = await Promise.all(
    files.map(async (file) => {
      const blobRes = await fetch(`${API_BASE}/repos/${GITHUB_REPO}/git/blobs`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({
          content: file.content,
          encoding: 'utf-8',
        }),
      });
      if (!blobRes.ok) throw new Error(`Failed to create blob for ${file.path}: ${blobRes.status}`);
      const blobData = await blobRes.json();
      return {
        path: file.path,
        mode: '100644' as const,
        type: 'blob' as const,
        sha: blobData.sha,
      };
    })
  );

  // 4. Create a new tree
  const treeRes = await fetch(`${API_BASE}/repos/${GITHUB_REPO}/git/trees`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({
      base_tree: baseTreeSha,
      tree,
    }),
  });
  if (!treeRes.ok) throw new Error(`Failed to create tree: ${treeRes.status}`);
  const treeData = await treeRes.json();

  // 5. Create a new commit
  const newCommitRes = await fetch(`${API_BASE}/repos/${GITHUB_REPO}/git/commits`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({
      message,
      tree: treeData.sha,
      parents: [latestCommitSha],
    }),
  });
  if (!newCommitRes.ok) throw new Error(`Failed to create commit: ${newCommitRes.status}`);
  const newCommitData = await newCommitRes.json();

  // 6. Update the reference
  const updateRefRes = await fetch(`${API_BASE}/repos/${GITHUB_REPO}/git/refs/heads/main`, {
    method: 'PATCH',
    headers: headers(),
    body: JSON.stringify({
      sha: newCommitData.sha,
    }),
  });
  if (!updateRefRes.ok) throw new Error(`Failed to update ref: ${updateRefRes.status}`);
}
