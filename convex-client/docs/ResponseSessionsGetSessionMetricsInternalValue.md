# ResponseSessionsGetSessionMetricsInternalValue


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**completed** | [**ResponseSessionsGetSessionMetricsInternalValueCompleted**](ResponseSessionsGetSessionMetricsInternalValueCompleted.md) |  | 
**in_progress** | [**ResponseSessionsGetSessionMetricsInternalValueCompleted**](ResponseSessionsGetSessionMetricsInternalValueCompleted.md) |  | 
**not_started** | [**ResponseSessionsGetSessionMetricsInternalValueCompleted**](ResponseSessionsGetSessionMetricsInternalValueCompleted.md) |  | 

## Example

```python
from convex_client.models.response_sessions_get_session_metrics_internal_value import ResponseSessionsGetSessionMetricsInternalValue

# TODO update the JSON string below
json = "{}"
# create an instance of ResponseSessionsGetSessionMetricsInternalValue from a JSON string
response_sessions_get_session_metrics_internal_value_instance = ResponseSessionsGetSessionMetricsInternalValue.from_json(json)
# print the JSON string representation of the object
print(ResponseSessionsGetSessionMetricsInternalValue.to_json())

# convert the object into a dict
response_sessions_get_session_metrics_internal_value_dict = response_sessions_get_session_metrics_internal_value_instance.to_dict()
# create an instance of ResponseSessionsGetSessionMetricsInternalValue from a dict
response_sessions_get_session_metrics_internal_value_from_dict = ResponseSessionsGetSessionMetricsInternalValue.from_dict(response_sessions_get_session_metrics_internal_value_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


