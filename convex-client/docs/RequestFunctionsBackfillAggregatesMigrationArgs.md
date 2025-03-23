# RequestFunctionsBackfillAggregatesMigrationArgs


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**batch_size** | **float** |  | [optional] 
**cursor** | **str** |  | [optional] 
**dry_run** | **bool** |  | [optional] 
**fn** | **str** |  | [optional] 
**next** | **List[str]** |  | [optional] 

## Example

```python
from convex_client.models.request_functions_backfill_aggregates_migration_args import RequestFunctionsBackfillAggregatesMigrationArgs

# TODO update the JSON string below
json = "{}"
# create an instance of RequestFunctionsBackfillAggregatesMigrationArgs from a JSON string
request_functions_backfill_aggregates_migration_args_instance = RequestFunctionsBackfillAggregatesMigrationArgs.from_json(json)
# print the JSON string representation of the object
print(RequestFunctionsBackfillAggregatesMigrationArgs.to_json())

# convert the object into a dict
request_functions_backfill_aggregates_migration_args_dict = request_functions_backfill_aggregates_migration_args_instance.to_dict()
# create an instance of RequestFunctionsBackfillAggregatesMigrationArgs from a dict
request_functions_backfill_aggregates_migration_args_from_dict = RequestFunctionsBackfillAggregatesMigrationArgs.from_dict(request_functions_backfill_aggregates_migration_args_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


