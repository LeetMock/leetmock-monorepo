# ResponseFunctionsBackfillSessionsMigration


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**status** | **str** |  | 
**error_message** | **str** |  | [optional] 
**error_data** | **object** |  | [optional] 
**value** | **object** |  | [optional] 

## Example

```python
from convex_client.models.response_functions_backfill_sessions_migration import ResponseFunctionsBackfillSessionsMigration

# TODO update the JSON string below
json = "{}"
# create an instance of ResponseFunctionsBackfillSessionsMigration from a JSON string
response_functions_backfill_sessions_migration_instance = ResponseFunctionsBackfillSessionsMigration.from_json(json)
# print the JSON string representation of the object
print(ResponseFunctionsBackfillSessionsMigration.to_json())

# convert the object into a dict
response_functions_backfill_sessions_migration_dict = response_functions_backfill_sessions_migration_instance.to_dict()
# create an instance of ResponseFunctionsBackfillSessionsMigration from a dict
response_functions_backfill_sessions_migration_from_dict = ResponseFunctionsBackfillSessionsMigration.from_dict(response_functions_backfill_sessions_migration_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


