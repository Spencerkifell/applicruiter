import { HttpHeaders } from '@angular/common/http';
import { Organization } from './models';

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
