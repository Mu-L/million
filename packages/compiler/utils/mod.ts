import { addNamed } from '@babel/helper-module-imports';
import type { Options } from '../options';
import { Info } from '../babel';
import { NodePath } from '@babel/core';

export const resolveImportSource = (options: Options, source: string) => {
  if (!source.startsWith('million/react')) return null;
  const mode = options.mode || 'react';
  if (options.server) {
    return `million/${mode}-server`;
  }
  return `million/${mode}`;
};

export const addImport = (
  path: NodePath,
  name: string,
  source: string,
  info: Info
) => {
  const hasProgramBinding = info.programPath.scope.hasBinding(name);
  const hasLocalBinding = path.scope.hasBinding(name);

  if (info.imports[name] && hasProgramBinding && hasLocalBinding) {
    return info.imports[name];
  }

  const id = addNamed(info.programPath, name, source);

  if (info.imports.source === source && name in info.imports) {
    if (!info.imports[name]) {
      info.imports[name] = id.name;
      info.imports.aliases[name] = new Set([id.name]);
    }
    info.imports.aliases[name].add(name);
  }
  return id;
};

export const isUseClient = (info: Info) => {
  const directives = info.programPath.node.directives;
  const directivesLength = directives.length;
  if (!directivesLength) return; // we assume it's server component only
  for (let i = 0; i < directivesLength; ++i) {
    const directive = directives[i];
    if (directive?.value.value === 'use client') return true;
  }
  return false;
};