# ResponseUserProfilesGetByEmailInternal


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**status** | **str** |  | 
**error_message** | **str** |  | [optional] 
**error_data** | **object** |  | [optional] 
**value** | **object** |  | [optional] 

## Example

```python
from convex_client.models.response_user_profiles_get_by_email_internal import ResponseUserProfilesGetByEmailInternal

# TODO update the JSON string below
json = "{}"
# create an instance of ResponseUserProfilesGetByEmailInternal from a JSON string
response_user_profiles_get_by_email_internal_instance = ResponseUserProfilesGetByEmailInternal.from_json(json)
# print the JSON string representation of the object
print(ResponseUserProfilesGetByEmailInternal.to_json())

# convert the object into a dict
response_user_profiles_get_by_email_internal_dict = response_user_profiles_get_by_email_internal_instance.to_dict()
# create an instance of ResponseUserProfilesGetByEmailInternal from a dict
response_user_profiles_get_by_email_internal_from_dict = ResponseUserProfilesGetByEmailInternal.from_dict(response_user_profiles_get_by_email_internal_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


