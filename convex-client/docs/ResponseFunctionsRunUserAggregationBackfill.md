# ResponseFunctionsRunUserAggregationBackfill


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**status** | **str** |  | 
**error_message** | **str** |  | [optional] 
**error_data** | **object** |  | [optional] 
**value** | **object** |  | [optional] 

## Example

```python
from convex_client.models.response_functions_run_user_aggregation_backfill import ResponseFunctionsRunUserAggregationBackfill

# TODO update the JSON string below
json = "{}"
# create an instance of ResponseFunctionsRunUserAggregationBackfill from a JSON string
response_functions_run_user_aggregation_backfill_instance = ResponseFunctionsRunUserAggregationBackfill.from_json(json)
# print the JSON string representation of the object
print(ResponseFunctionsRunUserAggregationBackfill.to_json())

# convert the object into a dict
response_functions_run_user_aggregation_backfill_dict = response_functions_run_user_aggregation_backfill_instance.to_dict()
# create an instance of ResponseFunctionsRunUserAggregationBackfill from a dict
response_functions_run_user_aggregation_backfill_from_dict = ResponseFunctionsRunUserAggregationBackfill.from_dict(response_functions_run_user_aggregation_backfill_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


