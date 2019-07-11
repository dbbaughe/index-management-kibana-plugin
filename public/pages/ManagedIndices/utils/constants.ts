export const DEFAULT_PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

export const DEFAULT_QUERY_PARAMS = {
  from: 0,
  size: 20,
  search: '',
  sortField: 'name',
  sortDirection: 'desc',
};

export const ACTIONS: {
  [action: string]: string;
  rollover: string;
  delete: string;
  open: string;
  close: string;
  transition: string;
} = {
  rollover: 'Rollover',
  delete: 'Delete',
  transition: 'Transition',
  open: 'Open',
  close: 'Close',
};
