import { HttpHeaders } from '@angular/common/http';
import { JobPosting, Organization } from './models';

export function getAuthHeaderParams(claims: any) {
  const accessToken = claims.__raw;
  const userAuthId = claims.sub;

  const headers = new HttpHeaders({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${accessToken}`,
  });

  return { headers, params: { userAuthId } };
}

export function instantiateNewOrganization(
  data: any,
  owner: number
): Organization | null {
  const { org_id: id, name, country, city, address } = data;

  if (!id || !name || !country || !city || !address || !owner) return null;

  const dateCreated = new Date().toLocaleDateString('en-US');

  return {
    id: id,
    name: name,
    owner: owner,
    address: address,
    country: country,
    city: city,
    totalMembers: 1,
    totalListings: 0,
    dateCreated: dateCreated,
  };
}

export function createOrganization(data: any): Organization {
  return {
    id: data.id,
    name: data.name,
    owner: data.owner,
    address: data.address,
    country: data.country,
    city: data.city,
    totalMembers: 1, // TODO (2): Get the total number of members for the organization
    totalListings: 1, // TODO (3): Get the total number of listings for the organization
    dateCreated: data.created_at,
  };
}

export function instantiateNewJob(data: any): JobPosting | null {
  const {
    id,
    org,
    title,
    description,
    skills,
    level,
    country,
    city,
    created_at: createdAt,
    updated_at: updatedAt,
    deleted_at: deletedAt,
  } = data;

  if (
    !id ||
    !org ||
    !title ||
    !description ||
    !title ||
    !description ||
    !skills ||
    !level
  )
    return null;

  const createdAtStr = createdAt
    ? new Date(createdAt).toLocaleDateString('en-US')
    : new Date().toLocaleDateString('en-US');

  return {
    id: id,
    org: org,
    title: title,
    description: description,
    skills: skills,
    level: level,
    country: country,
    city: city,
    createdAt: createdAtStr,
    updatedAt: updatedAt,
    deletedAt: deletedAt,
  };
}

export function createJobPostings(data: any): JobPosting[] {
  return data.map((job: any) => {
    return {
      id: job.id,
      org: job.org,
      title: job.title,
      description: job.description,
      level: job.level,
      country: job.country,
      city: job.city,
      skills: job.skills,
      createdAt: job.created_at,
      updatedAt: job.updated_at,
      deletedAt: job.deleted_at,
    };
  });
}

export function validateExpiration(exp: number): boolean {
  const now = new Date().getTime() / 1000;
  return now < exp;
}
