# ResponseSessionsGetSessionMetricsInternal


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**status** | **str** |  | 
**error_message** | **str** |  | [optional] 
**error_data** | **object** |  | [optional] 
**value** | [**ResponseSessionsGetSessionMetricsInternalValue**](ResponseSessionsGetSessionMetricsInternalValue.md) |  | [optional] 

## Example

```python
from convex_client.models.response_sessions_get_session_metrics_internal import ResponseSessionsGetSessionMetricsInternal

# TODO update the JSON string below
json = "{}"
# create an instance of ResponseSessionsGetSessionMetricsInternal from a JSON string
response_sessions_get_session_metrics_internal_instance = ResponseSessionsGetSessionMetricsInternal.from_json(json)
# print the JSON string representation of the object
print(ResponseSessionsGetSessionMetricsInternal.to_json())

# convert the object into a dict
response_sessions_get_session_metrics_internal_dict = response_sessions_get_session_metrics_internal_instance.to_dict()
# create an instance of ResponseSessionsGetSessionMetricsInternal from a dict
response_sessions_get_session_metrics_internal_from_dict = ResponseSessionsGetSessionMetricsInternal.from_dict(response_sessions_get_session_metrics_internal_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


