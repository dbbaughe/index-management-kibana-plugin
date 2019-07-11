import { ElasticsearchService, IndexService, ManagedIndexService, PolicyService } from '../services';

export interface Services {
  // elasticsearchService: ElasticsearchService;
  indexService: IndexService;
  managedIndexService: ManagedIndexService;
  policyService: PolicyService;
}
