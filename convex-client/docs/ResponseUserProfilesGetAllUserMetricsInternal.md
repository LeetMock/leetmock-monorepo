# ResponseUserProfilesGetAllUserMetricsInternal


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**status** | **str** |  | 
**error_message** | **str** |  | [optional] 
**error_data** | **object** |  | [optional] 
**value** | **object** |  | [optional] 

## Example

```python
from convex_client.models.response_user_profiles_get_all_user_metrics_internal import ResponseUserProfilesGetAllUserMetricsInternal

# TODO update the JSON string below
json = "{}"
# create an instance of ResponseUserProfilesGetAllUserMetricsInternal from a JSON string
response_user_profiles_get_all_user_metrics_internal_instance = ResponseUserProfilesGetAllUserMetricsInternal.from_json(json)
# print the JSON string representation of the object
print(ResponseUserProfilesGetAllUserMetricsInternal.to_json())

# convert the object into a dict
response_user_profiles_get_all_user_metrics_internal_dict = response_user_profiles_get_all_user_metrics_internal_instance.to_dict()
# create an instance of ResponseUserProfilesGetAllUserMetricsInternal from a dict
response_user_profiles_get_all_user_metrics_internal_from_dict = ResponseUserProfilesGetAllUserMetricsInternal.from_dict(response_user_profiles_get_all_user_metrics_internal_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


