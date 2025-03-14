# ResponseFunctionsRunSessionAggregationBackfill


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**status** | **str** |  | 
**error_message** | **str** |  | [optional] 
**error_data** | **object** |  | [optional] 
**value** | **object** |  | [optional] 

## Example

```python
from convex_client.models.response_functions_run_session_aggregation_backfill import ResponseFunctionsRunSessionAggregationBackfill

# TODO update the JSON string below
json = "{}"
# create an instance of ResponseFunctionsRunSessionAggregationBackfill from a JSON string
response_functions_run_session_aggregation_backfill_instance = ResponseFunctionsRunSessionAggregationBackfill.from_json(json)
# print the JSON string representation of the object
print(ResponseFunctionsRunSessionAggregationBackfill.to_json())

# convert the object into a dict
response_functions_run_session_aggregation_backfill_dict = response_functions_run_session_aggregation_backfill_instance.to_dict()
# create an instance of ResponseFunctionsRunSessionAggregationBackfill from a dict
response_functions_run_session_aggregation_backfill_from_dict = ResponseFunctionsRunSessionAggregationBackfill.from_dict(response_functions_run_session_aggregation_backfill_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


