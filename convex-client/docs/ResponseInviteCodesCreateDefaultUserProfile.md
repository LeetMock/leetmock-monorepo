# ResponseInviteCodesCreateDefaultUserProfile


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**status** | **str** |  | 
**error_message** | **str** |  | [optional] 
**error_data** | **object** |  | [optional] 
**value** | **object** |  | [optional] 

## Example

```python
from convex_client.models.response_invite_codes_create_default_user_profile import ResponseInviteCodesCreateDefaultUserProfile

# TODO update the JSON string below
json = "{}"
# create an instance of ResponseInviteCodesCreateDefaultUserProfile from a JSON string
response_invite_codes_create_default_user_profile_instance = ResponseInviteCodesCreateDefaultUserProfile.from_json(json)
# print the JSON string representation of the object
print(ResponseInviteCodesCreateDefaultUserProfile.to_json())

# convert the object into a dict
response_invite_codes_create_default_user_profile_dict = response_invite_codes_create_default_user_profile_instance.to_dict()
# create an instance of ResponseInviteCodesCreateDefaultUserProfile from a dict
response_invite_codes_create_default_user_profile_from_dict = ResponseInviteCodesCreateDefaultUserProfile.from_dict(response_invite_codes_create_default_user_profile_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


