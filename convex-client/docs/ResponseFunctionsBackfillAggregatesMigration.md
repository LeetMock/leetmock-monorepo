# ResponseFunctionsBackfillAggregatesMigration


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**status** | **str** |  | 
**error_message** | **str** |  | [optional] 
**error_data** | **object** |  | [optional] 
**value** | **object** |  | [optional] 

## Example

```python
from convex_client.models.response_functions_backfill_aggregates_migration import ResponseFunctionsBackfillAggregatesMigration

# TODO update the JSON string below
json = "{}"
# create an instance of ResponseFunctionsBackfillAggregatesMigration from a JSON string
response_functions_backfill_aggregates_migration_instance = ResponseFunctionsBackfillAggregatesMigration.from_json(json)
# print the JSON string representation of the object
print(ResponseFunctionsBackfillAggregatesMigration.to_json())

# convert the object into a dict
response_functions_backfill_aggregates_migration_dict = response_functions_backfill_aggregates_migration_instance.to_dict()
# create an instance of ResponseFunctionsBackfillAggregatesMigration from a dict
response_functions_backfill_aggregates_migration_from_dict = ResponseFunctionsBackfillAggregatesMigration.from_dict(response_functions_backfill_aggregates_migration_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


