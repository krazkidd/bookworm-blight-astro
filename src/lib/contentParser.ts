import { getCollection, getEntries } from "astro:content";
import type { CollectionEntry } from 'astro:content';

import { slugify } from "./utils/textConverter";

export async function getAllAuthors() {
  return getCollection('authors', ({ data }) => !(import.meta.env.PROD && data.draft));
};

export async function getAllPosts() {
  return getCollection('posts', ({ data }) => !(import.meta.env.PROD && data.draft));
};

export async function getAuthorsByPost(post: CollectionEntry<'posts'>) {
  return getEntries(post.data.authors);
};

export async function getAllPostsByAuthor(author: CollectionEntry<'authors'>) {
  return getCollection('posts', ({ data }) => !(import.meta.env.PROD && data.draft) && data.authors.map(author => author.slug).includes(author.slug));
};

export async function getFeaturedPosts() {
  return getCollection('posts', ({ data }) => !(import.meta.env.PROD && data.draft) && data.featured);
};

export async function getAllPostCategories() {
  const taxonomyPages = (await getAllPosts()).map(({ data }) => data.categories);

  const taxonomies = taxonomyPages.reduce((acc, currentValue) => {
    return acc.concat(currentValue.map(category => slugify(category)!));
  }, []);

  return [...new Set(taxonomies)];
};

export async function getAllPostTags() {
  const taxonomyPages = (await getAllPosts()).map(({ data }) => data.tags);

  const taxonomies = taxonomyPages.reduce((acc, currentValue) => {
    return acc.concat(currentValue.map(tag => slugify(tag)!));
  }, []);

  return [...new Set(taxonomies)];
};

export async function getAllServices() {
  return getCollection('services', ({ data }) => !(import.meta.env.PROD && data.draft));
};

export async function getAllPortfolioProjects() {
  return getCollection('portfolio', ({ data }) => !(import.meta.env.PROD && data.draft));
};
