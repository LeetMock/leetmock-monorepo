# ResponseCodeSessionEventsGetLatestTestcaseChangeEvent


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**status** | **str** |  | 
**error_message** | **str** |  | [optional] 
**error_data** | **object** |  | [optional] 
**value** | [**ResponseCodeSessionEventsGetLatestTestcaseChangeEventValue**](ResponseCodeSessionEventsGetLatestTestcaseChangeEventValue.md) |  | [optional] 

## Example

```python
from convex_client.models.response_code_session_events_get_latest_testcase_change_event import ResponseCodeSessionEventsGetLatestTestcaseChangeEvent

# TODO update the JSON string below
json = "{}"
# create an instance of ResponseCodeSessionEventsGetLatestTestcaseChangeEvent from a JSON string
response_code_session_events_get_latest_testcase_change_event_instance = ResponseCodeSessionEventsGetLatestTestcaseChangeEvent.from_json(json)
# print the JSON string representation of the object
print(ResponseCodeSessionEventsGetLatestTestcaseChangeEvent.to_json())

# convert the object into a dict
response_code_session_events_get_latest_testcase_change_event_dict = response_code_session_events_get_latest_testcase_change_event_instance.to_dict()
# create an instance of ResponseCodeSessionEventsGetLatestTestcaseChangeEvent from a dict
response_code_session_events_get_latest_testcase_change_event_from_dict = ResponseCodeSessionEventsGetLatestTestcaseChangeEvent.from_dict(response_code_session_events_get_latest_testcase_change_event_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


