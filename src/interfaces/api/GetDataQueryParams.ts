export interface GetDataQueryParams {
  sortBy?: string;
  order?: 'asc' | 'desc';
  name?: string; // GUID of the model
  formfactor?: string; // GUID of the form factor
  chemistry?: string; // GUID of the chemistry
}