# ResponseUserProfilesGetUserProfileInternal


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**status** | **str** |  | 
**error_message** | **str** |  | [optional] 
**error_data** | **object** |  | [optional] 
**value** | **object** |  | [optional] 

## Example

```python
from convex_client.models.response_user_profiles_get_user_profile_internal import ResponseUserProfilesGetUserProfileInternal

# TODO update the JSON string below
json = "{}"
# create an instance of ResponseUserProfilesGetUserProfileInternal from a JSON string
response_user_profiles_get_user_profile_internal_instance = ResponseUserProfilesGetUserProfileInternal.from_json(json)
# print the JSON string representation of the object
print(ResponseUserProfilesGetUserProfileInternal.to_json())

# convert the object into a dict
response_user_profiles_get_user_profile_internal_dict = response_user_profiles_get_user_profile_internal_instance.to_dict()
# create an instance of ResponseUserProfilesGetUserProfileInternal from a dict
response_user_profiles_get_user_profile_internal_from_dict = ResponseUserProfilesGetUserProfileInternal.from_dict(response_user_profiles_get_user_profile_internal_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


